import { parse, Spec, Block, tokenizers } from "comment-parser";
import {
  addStarsToTheBeginningOfTheLines,
  convertToModernType,
  formatType,
  detectEndOfLine,
  findPluginByParser,
  isDefaultTag,
} from "./utils.js";
import { DESCRIPTION, PARAM, RETURNS, EXAMPLE, IMPORT } from "./tags.js";
import {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_GROUP_HEAD,
  TAGS_GROUP_CONDITION,
  TAGS_NAMELESS,
  TAGS_ORDER,
  TAGS_SYNONYMS,
  TAGS_TYPELESS,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles.js";
import { AST, AllOptions, PrettierComment } from "./types.js";
import { stringify } from "./stringify.js";
import { Parser } from "prettier";
import { SPACE_TAG_DATA } from "./tags.js";

const {
  name: nameTokenizer,
  tag: tagTokenizer,
  type: typeTokenizer,
  description: descriptionTokenizer,
} = tokenizers;

/** @link https://prettier.io/docs/en/api.html#custom-parser-api} */
export const getParser = (originalParse: Parser["parse"], parserName: string) =>
  async function jsdocParser(
    text: string,
    parsersOrOptions: Parameters<Parser["parse"]>[1],
    maybeOptions?: AllOptions,
  ): Promise<AST> {
    let options = (maybeOptions ?? parsersOrOptions) as AllOptions;
    const prettierParse =
      findPluginByParser(parserName, options)?.parse || originalParse;

    const ast = prettierParse(text, options) as AST;

    options = {
      ...options,
      printWidth: options.jsdocPrintWidth ?? options.printWidth,
    };

    const eol =
      options.endOfLine === "auto" ? detectEndOfLine(text) : options.endOfLine;
    options = { ...options, endOfLine: "lf" };

    await Promise.all(
      ast.comments.map(async (comment) => {
        if (!isBlockComment(comment)) return;

        const paramsOrder = getParamsOrders(text, comment);
        const originalValue = comment.value;

        /** Issue: https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/18 */
        comment.value = comment.value.replace(/^([*]+)/g, "*");
        // Create the full comment string with line ends normalized to \n
        // This means that all following code can assume \n and should only use
        // \n.
        const commentString = `/*${comment.value.replace(/\r\n?/g, "\n")}*/`;

        /**
         * Check if this comment block is a JSDoc. Based on:
         * https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
         */
        if (!/^\/\*\*[\s\S]+?\*\/$/.test(commentString)) return;

        const parsed = parse(commentString, {
          spacing: "preserve",
          tokenizers: [
            tagTokenizer(),
            (spec) => {
              if (isDefaultTag(spec.tag)) {
                return spec;
              }

              return typeTokenizer("preserve")(spec);
            },
            nameTokenizer(),
            descriptionTokenizer("preserve"),
          ],
        })[0];

        comment.value = "";

        if (!parsed) {
          // Error on commentParser
          return;
        }

        normalizeTags(parsed);
        convertCommentDescToDescTag(parsed);

        const commentContentPrintWidth = getIndentationWidth(
          comment,
          text,
          options,
        );

        let maxTagTitleLength = 0;
        let maxTagTypeLength = 0;
        let maxTagNameLength = 0;

        let tags = parsed.tags
          // Prepare tags data
          .map(({ type, optional, ...rest }) => {
            if (type) {
              /**
               * Convert optional to standard
               * https://jsdoc.app/tags-type.html#:~:text=Optional%20parameter
               */
              type = type.replace(/[=]$/, () => {
                optional = true;
                return "";
              });

              type = convertToModernType(type);
            }

            return {
              ...rest,
              type,
              optional,
            } as Spec;
          });

        // Group tags
        tags = sortTags(tags, paramsOrder, options);

        if (options.jsdocSeparateReturnsFromParam) {
          tags = tags.flatMap((tag, index) => {
            if (tag.tag === RETURNS && tags[index - 1]?.tag === PARAM) {
              return [SPACE_TAG_DATA, tag];
            }

            return [tag];
          });
        }
        if (options.jsdocAddDefaultToDescription) {
          tags = tags.map(addDefaultValueToDescription);
        }

        tags = await Promise.all(
          tags
            .map(assignOptionalAndDefaultToName)
            .map(async ({ type, ...rest }) => {
              if (type) {
                type = await formatType(type, {
                  ...options,
                  printWidth: commentContentPrintWidth,
                });
              }

              return {
                ...rest,
                type,
              } as Spec;
            }),
        ).then((formattedTags) =>
          formattedTags.map(({ type, name, description, tag, ...rest }) => {
            const isVerticallyAlignAbleTags =
              TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);

            if (isVerticallyAlignAbleTags) {
              maxTagTitleLength = Math.max(maxTagTitleLength, tag.length);
              maxTagTypeLength = Math.max(maxTagTypeLength, type.length);
              maxTagNameLength = Math.max(maxTagNameLength, name.length);
            }

            return {
              type,
              name,
              description,
              tag,
              ...rest,
            };
          }),
        );

        if (options.jsdocSeparateTagGroups) {
          tags = tags.flatMap((tag, index) => {
            const prevTag = tags[index - 1];
            if (
              prevTag &&
              prevTag.tag !== DESCRIPTION &&
              prevTag.tag !== EXAMPLE &&
              prevTag.tag !== SPACE_TAG_DATA.tag &&
              tag.tag !== SPACE_TAG_DATA.tag &&
              prevTag.tag !== tag.tag
            ) {
              return [SPACE_TAG_DATA, tag];
            }

            return [tag];
          });
        }

        const filteredTags = tags.filter(({ description, tag }) => {
          if (!description && TAGS_DESCRIPTION_NEEDED.includes(tag)) {
            return false;
          }
          return true;
        });

        // Create final jsDoc string
        for (const [tagIndex, tagData] of filteredTags.entries()) {
          const formattedTag = await stringify(
            tagData,
            tagIndex,
            filteredTags,
            { ...options, printWidth: commentContentPrintWidth },
            maxTagTitleLength,
            maxTagTypeLength,
            maxTagNameLength,
          );
          comment.value += formattedTag;
        }

        comment.value = comment.value.trimEnd();

        if (comment.value) {
          comment.value = addStarsToTheBeginningOfTheLines(
            originalValue,
            comment.value,
            options,
          );
        }

        if (eol === "cr") {
          comment.value = comment.value.replace(/\n/g, "\r");
        } else if (eol === "crlf") {
          comment.value = comment.value.replace(/\n/g, "\r\n");
        }
      }),
    );

    ast.comments = ast.comments.filter(
      (comment) => !(isBlockComment(comment) && !comment.value),
    );

    return ast;
  };

function sortTags(
  tags: Spec[],
  paramsOrder: string[] | undefined,
  options: AllOptions,
): Spec[] {
  let canGroupNextTags = false;
  let shouldSortAgain = false;
  const importDetailsBySource: { [tag: string]: ImportDetails[] } = {};
  const importSourceByDescription: { [description: string]: string } = {};

  const tagGroups = tags.reduce<Spec[][]>((tagGroups, cur) => {
    if (
      tagGroups.length === 0 ||
      (TAGS_GROUP_HEAD.includes(cur.tag) && canGroupNextTags)
    ) {
      canGroupNextTags = false;
      tagGroups.push([]);
    }

    if (TAGS_GROUP_CONDITION.includes(cur.tag)) {
      canGroupNextTags = true;
    }

    if (cur.tag === IMPORT) {
      const importDetails = getImportDetails(cur);
      if (importDetails) {
        if (options.jsdocMergeImports) {
          const existingImport = importDetailsBySource[importDetails.src];
          if (existingImport) {
            importDetailsBySource[importDetails.src].push(importDetails);
            // do not add duplicate import tags to tagGroups
            return tagGroups;
          }
          importDetailsBySource[importDetails.src] = [importDetails];
        } else {
          writeImportDetailsToSpec(importDetails, options);
          importSourceByDescription[importDetails.spec.description] =
            importDetails.src;
        }
      }
    }

    tagGroups[tagGroups.length - 1].push(cur);

    return tagGroups;
  }, []);

  // Merge the import details for a given src into a printable tag description
  if (options.jsdocMergeImports) {
    Object.keys(importDetailsBySource).forEach((src) => {
      const importDetails = importDetailsBySource[src];
      // the first spec is the only one added to tagGroups
      const firstImpSpec = importDetails[0].spec;
      const { defaultImport, namedImports } = importDetails.reduce(
        (prev, curr) => {
          prev.namedImports.push(...curr.namedImports);
          // NB: the last default import encountered will be the one used
          if (curr.defaultImport) prev.defaultImport = curr.defaultImport;
          return prev;
        },
        { namedImports: [], defaultImport: undefined } as Pick<
          ImportDetails,
          "defaultImport" | "namedImports"
        >,
      );

      writeImportDetailsToSpec(
        { src, defaultImport, namedImports, spec: firstImpSpec },
        options,
      );
      importSourceByDescription[firstImpSpec.description] = src;
    });
  }

  tags = tagGroups.flatMap((tagGroup, index, array) => {
    // sort tags within groups
    tagGroup.sort((a, b) => {
      if (
        paramsOrder &&
        paramsOrder.length > 1 &&
        a.tag === PARAM &&
        b.tag === PARAM
      ) {
        const aIndex = paramsOrder.indexOf(a.name);
        const bIndex = paramsOrder.indexOf(b.name);
        if (aIndex > -1 && bIndex > -1) {
          //sort params
          return aIndex - bIndex;
        }
        return 0;
      }

      if (a.tag === IMPORT && b.tag === IMPORT) {
        const aSrc = importSourceByDescription[a.description] ?? a.description;
        const bSrc = importSourceByDescription[b.description] ?? a.description;
        const aVal = aSrc.startsWith(".") ? 1 : 0;
        const bVal = bSrc.startsWith(".") ? 1 : 0;
        if (aVal === bVal) return aSrc.localeCompare(bSrc);
        return aVal - bVal;
      }

      return (
        getTagOrderWeight(a.tag, options) - getTagOrderWeight(b.tag, options)
      );
    });

    // add an empty line between groups
    if (array.length - 1 !== index) {
      tagGroup.push(SPACE_TAG_DATA);
    }

    if (
      index > 0 &&
      tagGroup[0]?.tag &&
      !TAGS_GROUP_HEAD.includes(tagGroup[0].tag)
    ) {
      shouldSortAgain = true;
    }

    return tagGroup;
  });

  return shouldSortAgain ? sortTags(tags, paramsOrder, options) : tags;
}

/**
 * Control order of tags by weights. Smaller value brings tag higher.
 */
function getTagOrderWeight(tag: string, options: AllOptions): number {
  if (tag === DESCRIPTION && !options.jsdocDescriptionTag) {
    return -1;
  }
  let index;

  if (options.jsdocTagsOrder?.[tag] !== undefined) {
    index = options.jsdocTagsOrder[tag];
  } else {
    index = TAGS_ORDER[tag as keyof typeof TAGS_ORDER];
  }

  return index === undefined ? TAGS_ORDER.other : index;
}

function isBlockComment(comment: PrettierComment): boolean {
  return comment.type === "CommentBlock" || comment.type === "Block";
}

function getIndentationWidth(
  comment: PrettierComment,
  text: string,
  options: AllOptions,
): number {
  const line = text.split(/\r\n?|\n/g)[comment.loc.start.line - 1];

  let spaces = 0;
  let tabs = 0;
  for (let i = comment.loc.start.column - 1; i >= 0; i--) {
    const c = line[i];
    if (c === " ") {
      spaces++;
    } else if (c === "\t") {
      tabs++;
    } else {
      break;
    }
  }

  return options.printWidth - (spaces + tabs * options.tabWidth) - " * ".length;
}

const TAGS_ORDER_ENTRIES = Object.entries(TAGS_ORDER);
/**
 * This will adjust the casing of tag titles, resolve synonyms, fix
 * incorrectly parsed tags, correct incorrectly assigned names and types, and
 * trim spaces.
 *
 * @param parsed
 */
function normalizeTags(parsed: Block): void {
  parsed.tags = parsed.tags.map(
    ({ tag, type, name, description, default: _default, ...rest }) => {
      tag = tag || "";
      type = type || "";
      name = name || "";
      description = description || "";
      _default = _default?.trim();

      /** When the space between tag and type is missing */
      const tagSticksToType = tag.indexOf("{");
      if (tagSticksToType !== -1 && tag[tag.length - 1] === "}") {
        type = tag.slice(tagSticksToType + 1, -1) + " " + type;
        tag = tag.slice(0, tagSticksToType);
      }

      tag = tag.trim();
      const lower = tag.toLowerCase();
      const tagIndex = TAGS_ORDER_ENTRIES.findIndex(
        ([key]) => key.toLowerCase() === lower,
      );
      if (tagIndex >= 0) {
        tag = TAGS_ORDER_ENTRIES[tagIndex][0];
      } else if (lower in TAGS_SYNONYMS) {
        // resolve synonyms
        tag = TAGS_SYNONYMS[lower as keyof typeof TAGS_SYNONYMS];
      }

      type = type.trim();
      name = name.trim();

      if (name && TAGS_NAMELESS.includes(tag)) {
        description = `${name} ${description}`;
        name = "";
      }
      if (type && TAGS_TYPELESS.includes(tag)) {
        description = `{${type}} ${description}`;
        type = "";
      }

      return {
        tag,
        type,
        name,
        description,
        default: _default,
        ...rest,
      };
    },
  );
}

/**
 * This will merge the comment description and all `@description` tags into one
 * `@description` tag.
 *
 * @param parsed
 */
function convertCommentDescToDescTag(parsed: Block): void {
  let description = parsed.description || "";
  parsed.description = "";

  parsed.tags = parsed.tags.filter(({ description: _description, tag }) => {
    if (tag.toLowerCase() === DESCRIPTION) {
      if (_description.trim()) {
        description += "\n\n" + _description;
      }
      return false;
    } else {
      return true;
    }
  });

  if (description) {
    parsed.tags.unshift({
      tag: DESCRIPTION,
      description,
      name: undefined as any,
      type: undefined as any,
      source: [],
      optional: false,
      problems: [],
    });
  }
}

/**
 * This is for find params of function name in code as strings of array. Since
 * tokens are not available in newer Prettier versions, we'll parse the text
 * directly.
 */
function getParamsOrders(
  text: string,
  comment: PrettierComment,
): string[] | undefined {
  try {
    const lines = text.split("\n");
    let commentEnd = 0;
    for (let i = 0; i < comment.loc.end.line - 1; i++) {
      commentEnd += lines[i].length + 1;
    }
    commentEnd += comment.loc.end.column;

    const textAfterComment = text.slice(commentEnd);

    const functionMatch = textAfterComment.match(
      /^\s*function\s+\w*\s*\(([^)]*)\)/,
    );
    if (functionMatch) {
      const paramsString = functionMatch[1];
      const params = paramsString
        .split(",")
        .map((param) => {
          const trimmed = param.trim();
          const colonIndex = trimmed.indexOf(":");
          const paramName =
            colonIndex > -1 ? trimmed.slice(0, colonIndex) : trimmed;
          return paramName.split(/\s+/)[0].replace(/[{}[\]]/g, "");
        })
        .filter((param) => param && param !== "...");

      return params;
    }

    const arrowMatch = textAfterComment.match(
      /^\s*(?:const|let|var)\s+\w+\s*=\s*\(([^)]*)\)\s*=>/,
    );
    if (arrowMatch) {
      const paramsString = arrowMatch[1];
      const params = paramsString
        .split(",")
        .map((param) => {
          const trimmed = param.trim();
          const colonIndex = trimmed.indexOf(":");
          const paramName =
            colonIndex > -1 ? trimmed.slice(0, colonIndex) : trimmed;
          return paramName.split(/\s+/)[0].replace(/[{}[\]]/g, "");
        })
        .filter((param) => param && param !== "...");

      return params;
    }

    const methodMatch = textAfterComment.match(/^\s*(\w+)\s*\(([^)]*)\)/);
    if (methodMatch) {
      const paramsString = methodMatch[2];
      const params = paramsString
        .split(",")
        .map((param) => {
          const trimmed = param.trim();
          const colonIndex = trimmed.indexOf(":");
          const paramName =
            colonIndex > -1 ? trimmed.slice(0, colonIndex) : trimmed;
          return paramName.split(/\s+/)[0].replace(/[{}[\]]/g, "");
        })
        .filter((param) => param && param !== "...");

      return params;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * If the given tag has a default value, then this will add a note to the
 * description with that default value. This is done because TypeScript does
 * not display the documented JSDoc default value (e.g. `@param [name="John"]`).
 *
 * If the description already contains such a note, it will be updated.
 */
function addDefaultValueToDescription(tag: Spec): Spec {
  if (tag.optional && tag.default) {
    let { description } = tag;

    // remove old note
    description = description.replace(/(?:\s*Default\s+is\s+`.*?`\.?)+/g, "");

    // add a `.` at the end of previous sentences
    if (description && !/[.\n]$/.test(description)) {
      description += ".";
    }

    description += ` Default is \`${tag.default}\``;

    return {
      ...tag,
      description: description.trim(),
    };
  } else {
    return tag;
  }
}

/**
 * This will combine the `name`, `optional`, and `default` properties into name
 * setting the other two to `false` and `undefined` respectively.
 */
function assignOptionalAndDefaultToName({
  name,
  optional,
  default: default_,
  tag,
  type,
  source,
  description,
  ...rest
}: Spec): Spec {
  if (isDefaultTag(tag)) {
    const usefulSourceLine =
      source.find((x) => x.source.includes(`@${tag}`))?.source || "";

    const tagMatch = usefulSourceLine.match(
      /@default(Value)? (\[.*]|{.*}|\(.*\)|'.*'|".*"|`.*`| \w+)( ((?!\*\/).+))?/,
    );
    const tagValue = tagMatch?.[2] || "";
    const tagDescription = tagMatch?.[4] || "";

    if (tagMatch) {
      type = tagValue;
      name = "";
      description = tagDescription;
    }
  } else if (optional) {
    if (name) {
      // Figure out if tag type have default value
      if (default_) {
        name = `[${name}=${default_}]`;
      } else {
        name = `[${name}]`;
      }
    } else {
      type = `${type} | undefined`;
    }
  }

  return {
    ...rest,
    tag,
    name,
    description,
    optional,
    type,
    source,
    default: default_,
  };
}

type ImportDetails = {
  /** the spec associated with this import tag */
  spec: Spec;
  /** the source of the module that types were imported from */
  src: string;
  defaultImport?: string;
  /** the types that were imported */
  namedImports: {
    name: string;
    /** the alias assigned to the type (EX: alias of "B as B0" is "B0") */
    alias?: string;
  }[];
};

/**
 * Writes the import details given to the description field of the spec
 */
function writeImportDetailsToSpec(
  importDetails: ImportDetails,
  options: AllOptions,
) {
  const { defaultImport, namedImports, src, spec } = importDetails;

  // sort the import details
  namedImports.sort((a, b) =>
    (a.alias ?? a.name).localeCompare(b.alias ?? b.name),
  );

  // write the merged import details to the spec description
  const importClauses = [];
  if (defaultImport) importClauses.push(defaultImport);
  if (namedImports.length > 0) {
    const makeMultiLine =
      options.jsdocNamedImportLineSplitting && namedImports.length > 1;
    const typeString = namedImports
      .map((t) => {
        const val = t.alias ? `${t.name} as ${t.alias}` : `${t.name}`;
        return makeMultiLine ? `  ${val}` : val;
      })
      .join(makeMultiLine ? ",\n" : ", ");
    const namedImportClause = makeMultiLine
      ? `{\n${typeString}\n}`
      : options.jsdocNamedImportPadding
        ? `{ ${typeString} }`
        : `{${typeString}}`;
    importClauses.push(namedImportClause);
  }
  spec.description = `${importClauses.join(", ")} from "${src}"`;
}

/**
 * Extracts the defaultImports, namedImports, and src associated with a given import tag.
 */
function getImportDetails(spec: Spec): ImportDetails | null {
  // step 1: capture the default import, named import clause, and src
  const match = spec.description.match(
    /([^\s\\,\\{\\}]+)?(?:[^\\{\\}]*)\{?([^\\{\\}]*)?\}?(?:\s+from\s+)[\\'\\"](\S+)[\\'\\"]/s,
  );
  if (!match) return null;

  const defaultImport = match[1] || "";
  const namedImportsClause = match[2] || "";
  const src = match[3] || "";

  // step 2: get all named imports from the named import section
  const typeMatches = namedImportsClause.matchAll(
    /([^\s\\,\\{\\}]+)(?:\s+as\s+)?([^\s\\,\\{\\}]+)?/g,
  );

  const namedImports = [];
  for (const typeMatch of typeMatches) {
    namedImports.push({ name: typeMatch[1], alias: typeMatch[2] });
  }

  return { spec, src, namedImports, defaultImport };
}

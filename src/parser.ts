import commentParser from "comment-parser";
import {
  addStarsToTheBeginningOfTheLines,
  convertToModernType,
  formatType,
  detectEndOfLine,
} from "./utils";
import { DESCRIPTION, PARAM } from "./tags";
import {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_GROUP,
  TAGS_IS_CAMEL_CASE,
  TAGS_NAMELESS,
  TAGS_ORDER,
  TAGS_SYNONYMS,
  TAGS_TYPELESS,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { AST, JsdocOptions, PrettierComment } from "./types";
import { stringify } from "./stringify";
import { Parser } from "prettier";
import { SPACE_TAG_DATA } from "./tags";

/** @link https://prettier.io/docs/en/api.html#custom-parser-api} */
export const getParser = (parser: Parser["parse"]) =>
  function jsdocParser(
    text: string,
    parsers: Parameters<Parser["parse"]>[1],
    options: JsdocOptions,
  ): AST {
    const ast = parser(text, parsers, options) as AST;

    if (!options.jsdocParser) {
      return ast;
    }

    const eol =
      options.endOfLine === "auto" ? detectEndOfLine(text) : options.endOfLine;
    options = { ...options, endOfLine: "lf" };

    /**
     * Control order of tags by weights. Smaller value brings tag higher.
     *
     * @param {String} tagTitle TODO
     * @returns {Number} Tag weight
     */
    function getTagOrderWeight(tag: string): number {
      if (tag === DESCRIPTION && !options.jsdocDescriptionTag) {
        return -1;
      }
      const index = TAGS_ORDER.indexOf(tag);
      return index === -1 ? TAGS_ORDER.indexOf("other") : index;
    }

    ast.comments.forEach((comment) => {
      if (!isBlockComment(comment)) return;
      const tokenIndex = ast.tokens.findIndex(({ loc }) => loc === comment.loc);

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

      const parsed = commentParser(commentString, {
        dotted_names: false,
        trim: false,
      })[0];

      if (!parsed) {
        // Error on commentParser
        return;
      }

      comment.value = "";

      normalizeTags(parsed);
      convertCommentDescToDescTag(parsed);

      const commentContentPrintWidth =
        options.printWidth -
        getIndentationWidth(comment, text, options) -
        " * ".length;

      let maxTagTitleLength = 0;
      let maxTagTypeLength = 0;
      let maxTagNameLength = 0;

      parsed.tags
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
            type = formatType(type, {
              ...options,
              printWidth: commentContentPrintWidth,
            });
          }

          return {
            ...rest,
            type,
            optional,
          } as commentParser.Tag;
        })

        // Group tags
        .reduce<commentParser.Tag[][]>((tagGroups, cur, index, array) => {
          if (
            (tagGroups.length === 0 || TAGS_GROUP.includes(cur.tag)) &&
            array[index - 1]?.tag !== DESCRIPTION
          ) {
            tagGroups.push([]);
          }
          tagGroups[tagGroups.length - 1].push(cur);

          return tagGroups;
        }, [])
        .flatMap((tagGroup, index, tags) => {
          let paramsOrder: string[] | undefined;
          // next token
          const nextTokenType = ast.tokens[tokenIndex + 1]?.type;
          if (
            typeof nextTokenType === "object" &&
            nextTokenType.label === "function"
          ) {
            try {
              let openedParenthesesCount = 1;
              const endIndex = ast.tokens
                .slice(tokenIndex + 4)
                .findIndex(({ type }) => {
                  if (typeof type === "string") {
                    return false;
                  } else if (type.label === "(") {
                    openedParenthesesCount++;
                  } else if (type.label === ")") {
                    openedParenthesesCount--;
                  }

                  return openedParenthesesCount === 0;
                });

              const params = ast.tokens.slice(
                tokenIndex + 4,
                tokenIndex + 4 + endIndex + 1,
              );

              paramsOrder = params
                .filter(
                  ({ type }) =>
                    typeof type === "object" && type.label === "name",
                )
                .map(({ value }) => value);
            } catch {
              //
            }
          }

          // sort tags within groups
          tagGroup.sort((a, b) => {
            if (
              paramsOrder &&
              paramsOrder.length > 1 &&
              a.tag === PARAM &&
              b.tag === PARAM
            ) {
              //sort params
              return paramsOrder.indexOf(a.name) - paramsOrder.indexOf(b.name);
            }
            return getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag);
          });

          // add an empty line between groups
          if (tags.length - 1 !== index) {
            tagGroup.push(SPACE_TAG_DATA);
          }

          return tagGroup;
        })
        .map(
          ({
            type,
            name,
            optional,
            default: _default,
            description,
            tag,
            ...rest
          }) => {
            const isVerticallyAlignAbleTags = TAGS_VERTICALLY_ALIGN_ABLE.includes(
              tag,
            );

            if (type) {
              // Additional operations on name
              if (name) {
                // Optional tag name
                if (optional) {
                  // Figure out if tag type have default value
                  if (_default) {
                    description = description.replace(
                      /[ \t]*Default is `.*`\.?$/,
                      "",
                    );
                    if (description && !/[.\n]$/.test(description)) {
                      description += ".";
                    }
                    description += ` Default is \`${_default}\``;
                    name = `[${name}=${_default}]`;
                  } else {
                    name = `[${name}]`;
                  }
                }
              }
            }

            if (isVerticallyAlignAbleTags) {
              maxTagTitleLength = Math.max(maxTagTitleLength, tag.length);
              maxTagTypeLength = Math.max(maxTagTypeLength, type.length);
              maxTagNameLength = Math.max(maxTagNameLength, name.length);
            }

            description = description.trim();

            return {
              type,
              name,
              optional,
              default: _default,
              description,
              tag,
              ...rest,
            };
          },
        )
        .filter(({ description, tag }) => {
          if (!description && TAGS_DESCRIPTION_NEEDED.includes(tag)) {
            return false;
          }
          return true;
        })
        // Create final jsDoc string
        .forEach((tagData, tagIndex, finalTagsArray) => {
          comment.value += stringify(
            tagData,
            tagIndex,
            finalTagsArray,
            { ...options, printWidth: commentContentPrintWidth },
            maxTagTitleLength,
            maxTagTypeLength,
            maxTagNameLength,
          );
        });

      comment.value = comment.value.trimEnd();
      if (comment.value) {
        comment.value = addStarsToTheBeginningOfTheLines(comment.value);
      }

      if (eol === "cr") {
        comment.value = comment.value.replace(/\n/g, "\r");
      } else if (eol === "crlf") {
        comment.value = comment.value.replace(/\n/g, "\r\n");
      }
    });

    ast.comments = ast.comments.filter(
      (comment) => !(isBlockComment(comment) && !comment.value),
    );

    return ast;
  };

function isBlockComment(comment: PrettierComment): boolean {
  return comment.type === "CommentBlock" || comment.type === "Block";
}

function getIndentationWidth(
  comment: PrettierComment,
  text: string,
  options: JsdocOptions,
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

  return spaces + tabs * options.tabWidth;
}

/**
 * This will adjust the casing of tag titles, resolve synonyms, fix
 * incorrectly parsed tags, correct incorrectly assigned names and types, and
 * trim spaces.
 *
 * @param parsed
 */
function normalizeTags(parsed: commentParser.Comment): void {
  parsed.tags.forEach((t) => {
    t.tag = t.tag || "";
    t.type = t.type || "";
    t.name = t.name || "";
    t.description = t.description || "";
    t.default = t.default?.trim();

    /** When the space between tag and type is missing */
    const tagSticksToType = t.tag.indexOf("{");
    if (tagSticksToType !== -1 && t.tag[t.tag.length - 1] === "}") {
      t.type = t.tag.slice(tagSticksToType + 1, -1) + " " + t.type;
      t.tag = t.tag.slice(0, tagSticksToType);
    }

    t.tag = t.tag.trim();
    const lower = t.tag.toLowerCase();
    if (
      !TAGS_IS_CAMEL_CASE.includes(t.tag) &&
      (TAGS_ORDER.includes(lower) || lower in TAGS_SYNONYMS)
    ) {
      t.tag = lower;
    }

    // resolve synonyms
    if (t.tag in TAGS_SYNONYMS) {
      t.tag = TAGS_SYNONYMS[t.tag as keyof typeof TAGS_SYNONYMS];
    }

    t.type = t.type.trim();
    t.name = t.name.trim();

    if (t.name && TAGS_NAMELESS.includes(t.tag)) {
      t.description = `${t.name} ${t.description}`;
      t.name = "";
    }
    if (t.type && TAGS_TYPELESS.includes(t.tag)) {
      t.description = `{${t.type}} ${t.description}`;
      t.type = "";
    }

    t.description = t.description.trim();
  });
}

/**
 * This will merge the comment description and all `@description` tags into one
 * `@description` tag.
 *
 * @param parsed
 */
function convertCommentDescToDescTag(parsed: commentParser.Comment): void {
  let description = parsed.description || "";
  parsed.description = "";

  parsed.tags = parsed.tags.filter((t) => {
    if (t.tag.toLowerCase() === DESCRIPTION) {
      // get description from source as some words may be parsed as the type
      // or name
      const desc = t.source.replace(/^@\w+/, "").trim();
      if (desc) {
        description += "\n\n" + desc;
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
      source: "<Unknown>",
      line: NaN,
      optional: false,
    });
  }
}

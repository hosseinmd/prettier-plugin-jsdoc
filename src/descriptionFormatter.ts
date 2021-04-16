import { format, BuiltInParserName } from "prettier";
import { DESCRIPTION, EXAMPLE, PRIVATE_REMARKS, REMARKS, TODO } from "./tags";
import { AllOptions } from "./types";
import { capitalizer, formatCode } from "./utils";
import fromMarkdown from "mdast-util-from-markdown";
import { Root, Content } from "mdast";

const TABLE = "2@^5!~#sdE!_TABLE";

interface DescriptionEndLineParams {
  tag: string;
  isEndTag: boolean;
}

const parserSynonyms: Record<string, BuiltInParserName[]> = {
  js: ["babel", "babel-flow", "vue"],
  javascript: ["babel", "babel-flow", "vue"],
  ts: ["typescript", "babel-ts", "angular"],
  typescript: ["typescript", "babel-ts", "angular"],
  json: ["json", "json5", "json-stringify"],
};

function descriptionEndLine({
  tag,
  isEndTag,
}: DescriptionEndLineParams): string {
  if ([DESCRIPTION, EXAMPLE, TODO].includes(tag) && !isEndTag) {
    return "\n";
  }

  return "";
}

interface FormatOptions {
  tagStringLength?: number;
  beginningSpace: string;
}

/**
 * Trim, make single line with capitalized text. Insert dot if flag for it is
 * set to true and last character is a word character
 *
 * @private
 */
function formatDescription(
  tag: string,
  text: string,
  options: AllOptions,
  formatOptions: FormatOptions,
): string {
  if (!text) return text;

  const { printWidth } = options;
  const { tagStringLength = 0, beginningSpace } = formatOptions;

  /**
   * change list with dash to dot for example:
   * 1- a thing
   *
   * to
   *
   * 1. a thing
   */
  text = text.replace(/^(\d+)[-][\s|]+/g, "$1. "); // Start
  text = text.replace(/\n+(\s*\d+)[-][\s]+/g, "\n$1. ");

  const tables: string[] = [];
  text = text.replace(/((\n|^)\|[\s\S]*?)((\n[^|])|$)/g, (code, _1, _2, _3) => {
    code = _3 ? code.slice(0, -1) : code;

    tables.push(code);
    return `\n\n${TABLE}\n\n${_3 ? _3.slice(1) : ""}`;
  });
  text = capitalizer(text);

  text = `${"!".repeat(tagStringLength)}${
    text.startsWith("```") ? "\n" : ""
  }${text}`;

  let tableIndex = 0;

  const rootAst = fromMarkdown(text);

  function stringifyASTWithoutChildren(
    mdAst: Content | Root,
    intention: string,
    parent: Content | Root | null,
  ) {
    if (mdAst.type === "inlineCode") {
      return ` \`${mdAst.value}\``;
    }

    if (mdAst.type === "code") {
      let result = mdAst.value || "";
      let _intention = intention;

      if (result) {
        // Remove two space from lines, maybe added previous format
        if (mdAst.lang) {
          const supportParsers = parserSynonyms[mdAst.lang.toLowerCase()];
          const parser = supportParsers?.includes(options.parser as any)
            ? options.parser
            : supportParsers?.[0] || mdAst.lang;

          result = formatCode(result, intention, {
            ...options,
            parser,
            jsdocKeepUnParseAbleExampleIndent: true,
          });
        } else {
          _intention = intention + " ".repeat(4);

          result = formatCode(result, _intention, {
            ...options,
            jsdocKeepUnParseAbleExampleIndent: true,
          });
        }
      }
      result = mdAst.lang ? result : result.trimEnd();
      return result
        ? mdAst.lang
          ? `\n\n${_intention}\`\`\`${mdAst.lang}${result}\`\`\``
          : `\n${result}`
        : "";
    }

    if (mdAst.value === TABLE) {
      if (parent) {
        parent.costumeType = TABLE;
      }

      if (tables.length > 0) {
        let result = tables?.[tableIndex] || "";
        tableIndex++;
        if (result) {
          result = format(result, {
            ...options,
            parser: "markdown",
          }).trim();
        }
        return `${
          result
            ? `\n\n${intention}${result.split("\n").join(`\n${intention}`)}`
            : mdAst.value
        }`;
      }
    }

    if (mdAst.type === "break") {
      return `\\\n`;
    }

    return (mdAst.value || "") as string;
  }

  function stringyfy(
    mdAst: Content | Root,
    intention: string,
    parent: Content | Root | null,
  ): string {
    if (!Array.isArray(mdAst.children)) {
      return stringifyASTWithoutChildren(mdAst, intention, parent);
    }

    return (mdAst.children as Content[])
      .map((ast, index) => {
        if (ast.type === "listItem") {
          let _listCount = `\n${intention}- `;
          // .replace(/((?!(^))\n)/g, "\n" + _intention);
          if (typeof mdAst.start === "number") {
            const count = index + ((mdAst.start as number) ?? 1);
            _listCount = `\n${intention}${count}. `;
          }

          const _intention = intention + " ".repeat(_listCount.length - 1);

          const result = stringyfy(ast, _intention, mdAst).trim();

          return `${_listCount}${result}`;
        }

        if (ast.type === "list") {
          let end = "";
          /**
           * Add empty line after list if that is end of description
           * issue: {@link https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/98}
           */
          if (
            tag !== DESCRIPTION &&
            mdAst.type === "root" &&
            index === mdAst.children.length - 1
          ) {
            end = "\n";
          }
          return `\n${stringyfy(ast, intention, mdAst)}${end}`;
        }

        if (ast.type === "paragraph") {
          const paragraph = stringyfy(ast, intention, parent);
          if (ast.costumeType === TABLE) {
            return paragraph;
          }

          return `\n\n${paragraph
            /**
             * Break by backslash\
             * issue: https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/102
             */
            .split("\\\n")
            .map((_paragraph) => {
              _paragraph = _paragraph.replace(/\s+/g, " "); // Make single line

              _paragraph = capitalizer(_paragraph);
              if (options.jsdocDescriptionWithDot)
                _paragraph = _paragraph.replace(/([\w\p{L}])$/u, "$1."); // Insert dot if needed

              return breakDescriptionToLines(_paragraph, printWidth, intention);
            })
            .join("\\\n")}`;
        }

        if (ast.type === "strong") {
          return `**${stringyfy(ast, intention, mdAst)}**`;
        }

        if (ast.type === "emphasis") {
          return `*${stringyfy(ast, intention, mdAst)}*`;
        }

        if (ast.type === "heading") {
          return `\n\n${intention}${"#".repeat(ast.depth)} ${stringyfy(
            ast,
            intention,
            mdAst,
          )}`;
        }

        if (ast.type === "link") {
          return `[${stringyfy(ast, intention, mdAst)}](${ast.url})`;
        }

        return stringyfy(ast, intention, mdAst);
      })
      .join("");
  }

  let result = stringyfy(rootAst, beginningSpace, null);

  result = result.trimStart().slice(tagStringLength);

  return result;
}

function breakDescriptionToLines(
  desContent: string,
  maxWidth: number,
  beginningSpace: string,
): string {
  let str = desContent.trim();

  if (!str) {
    return str;
  }

  const extraLastLineWidth = 10;
  let result = "";
  while (str.length > maxWidth + extraLastLineWidth) {
    let sliceIndex = str.lastIndexOf(
      " ",
      str.startsWith("\n") ? maxWidth + 1 : maxWidth,
    );
    /**
     * When a str is a long word lastIndexOf will gives 4 every time loop
     * running unlimited time
     */
    if (sliceIndex <= beginningSpace.length)
      sliceIndex = str.indexOf(" ", beginningSpace.length + 1);

    if (sliceIndex === -1) sliceIndex = str.length;

    result += str.substring(0, sliceIndex);
    str = str.substring(sliceIndex + 1);
    if (str) {
      str = `${beginningSpace}${str}`;
      str = `\n${str}`;
    }
  }

  result += str;

  return `${beginningSpace}${result}`;
}

export { descriptionEndLine, FormatOptions, formatDescription };

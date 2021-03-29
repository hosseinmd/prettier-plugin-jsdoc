import { format, BuiltInParserName } from "prettier";
import { DESCRIPTION, EXAMPLE, TODO } from "./tags";
import { AllOptions } from "./types";
import { capitalizer, formatCode } from "./utils";
import fromMarkdown from "mdast-util-from-markdown";
import { Root, Content } from "mdast";

const TABLE = "2@^5!~#sdE!_TABLE";

interface DescriptionEndLineParams {
  description: string;
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
  description,
  tag,
  isEndTag,
}: DescriptionEndLineParams): string {
  if (description.trim().length < 0 || isEndTag) {
    return "";
  }

  if ([DESCRIPTION, EXAMPLE, TODO].includes(tag)) {
    return "\n";
  }

  return "";
}

interface FormatOptions {
  tagStringLength?: number;
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
  formatOptions: FormatOptions = {},
): string {
  if (!text) return text;

  const { printWidth, tsdoc } = options;
  const { tagStringLength = 0 } = formatOptions;

  // Wrap tag description
  const beginningSpace =
    tag === DESCRIPTION || (tag === EXAMPLE && tsdoc) ? "" : "  "; // google style guide space

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

  function stringyfy(
    mdAst: Content | Root,
    intention: string,
    parent: Content | Root | null,
  ): string {
    if (!Array.isArray(mdAst.children)) {
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

      return (mdAst.value || "") as string;
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
          return `\n${stringyfy(ast, intention, mdAst)}`;
        }

        if (ast.type === "paragraph") {
          let paragraph = stringyfy(ast, intention, parent);
          if (ast.costumeType === TABLE) {
            return paragraph;
          }
          paragraph = paragraph.replace(/\s+/g, " "); // Make single line

          paragraph = capitalizer(paragraph);
          if (options.jsdocDescriptionWithDot)
            paragraph = paragraph.replace(/([\w\p{L}])$/u, "$1."); // Insert dot if needed

          return `\n\n${breakDescriptionToLines(
            paragraph,
            printWidth,
            intention,
          )}`;
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
          console.log({ link: JSON.stringify(ast) });
          return `[${stringyfy(ast, intention, mdAst)}](${ast.url})`;
        }

        return stringyfy(ast, intention, mdAst);
      })
      .join("");
  }

  let result = stringyfy(rootAst, beginningSpace, null);

  result = result.trim().slice(tagStringLength);

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

    str = `${beginningSpace}${str}`;
    str = `\n${str}`;
  }

  result += str;

  return `${beginningSpace}${result}`;
}

export { descriptionEndLine, FormatOptions, formatDescription };

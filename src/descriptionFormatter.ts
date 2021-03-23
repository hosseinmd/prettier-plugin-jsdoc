import { format } from "prettier";
import { DESCRIPTION, EXAMPLE, TODO } from "./tags";
import { AllOptions } from "./types";
import { capitalizer, formatCode } from "./utils";

const EMPTY_LINE_SIGNATURE = "2@^5!~#sdE!_EMPTY_LINE_SIGNATURE";
const NEW_LINE_START_WITH_DASH = "2@^5!~#sdE!_NEW_LINE_START_WITH_DASH";
const NEW_DASH_LINE = "2@^5!~#sdE!_NEW_LINE_WITH_DASH";
const NEW_LINE_START_WITH_NUMBER = "2@^5!~#sdE!_NEW_LINE_START_WITH_NUMBER";
const NEW_PARAGRAPH_START_WITH_DASH =
  "2@^5!~#sdE!_NEW_PARAGRAPH_START_WITH_DASH";
const NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE =
  "2@^5!~#sdE!_NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE";
const CODE = "2@^5!~#sdE!_CODE";
const CODE_INDENTED = "2@^5!~#sdE!_CODE_INDENTED";
const TABLE = "2@^5!~#sdE!_TABLE";

interface DescriptionEndLineParams {
  description: string;
  tag: string;
  isEndTag: boolean;
}

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

  const { printWidth } = options;
  const { tagStringLength = 0 } = formatOptions;

  const codes = text.match(/[\s|]*```[\s\S]*?^[ \t]*```\s*/gm);

  if (codes) {
    codes.forEach((code) => {
      text = text.replace(code, `\n\n${CODE}\n\n`);
    });
  }
  const intendedCodes: string[] = [];
  text = text.replace(
    /(\n\n[^\S\r\n]{4}[\s\S]*?)((\n[\S])|$)/g,
    (code, _1, _2, _3) => {
      code = _3 ? code.slice(0, -1) : code;

      intendedCodes.push(code);
      return `\n\n${CODE_INDENTED}\n\n${_3 ? _3.slice(1) : ""}`;
    },
  );

  const tables: string[] = [];
  text = text.replace(/((\n|^)\|[\s\S]*?)((\n[^|])|$)/g, (code, _1, _2, _3) => {
    code = _3 ? code.slice(0, -1) : code;

    tables.push(code);
    return `\n\n${TABLE}\n\n${_3 ? _3.slice(1) : ""}`;
  });

  /**
   * Description
   *
   * # Example
   *
   * Summry
   */
  text = text.replace(/\n([\s]+)?(#{1,6})(.*)$\s+/gm, "\n\n$2 $3\n\n");

  /**
   * 1. a thing
   *
   * 2. another thing
   */
  text = text.replace(/^(\d+)[-.][\s-.|]+/g, "$1. "); // Start

  text = text.replace(/\n\s+[1][-.][\s-.|]+/g, EMPTY_LINE_SIGNATURE + "1. "); // add an empty line before of `1.`

  text = text.replace(
    /\s+(\d+)[-.][\s-.|]+/g,
    NEW_LINE_START_WITH_NUMBER + "$1. ",
  );

  text = text.replace(
    /(\n(\s+)?(---(\s|-)+)\n)/g, // `------- --- --- -` | `----`
    NEW_DASH_LINE,
  );

  text = text.replace(
    /(\n([^\S\r\n]+)?\n[^\S\r\n]{2}[^\S\r\n]+)/g,
    NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE,
  ); // Add a signature for new paragraph start with three space

  text = text.replace(
    /(\n\n+(\s+)?[-*]([^\S\r\n]+))/g, // `\n\n - ` | `\n\n-` | `\n\n -` | `\n\n- `
    NEW_PARAGRAPH_START_WITH_DASH,
  );

  text = text.replace(
    /\n\s*[-*]([^\S\r\n]+)/g, // `\n - ` | `\n-` | `\n -` | `\n- `
    NEW_LINE_START_WITH_DASH,
  );

  text = text.replace(/(\n(\s+)?\n+)/g, EMPTY_LINE_SIGNATURE); // Add a signature for empty line and use that later
  // text = text.replace(/\n\s\s\s+/g, NEW_LINE_START_THREE_SPACE_SIGNATURE); // Add a signature for new line start with three space

  text = capitalizer(text);

  text = `${"_".repeat(tagStringLength)}${text}`;

  // Wrap tag description
  const beginningSpace = tag === DESCRIPTION ? "" : "  "; // google style guide space

  text = text
    .split(NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE)
    .map((newParagraph) => {
      return newParagraph
        .split(EMPTY_LINE_SIGNATURE)
        .map(
          (newEmptyLineWithDash) =>
            newEmptyLineWithDash
              .split(NEW_LINE_START_WITH_NUMBER)
              .map(
                (newLineWithNumber) =>
                  newLineWithNumber
                    .split(NEW_DASH_LINE)
                    .map(
                      (newDashLine) =>
                        newDashLine
                          .split(NEW_PARAGRAPH_START_WITH_DASH)
                          .map(
                            (newLineWithDash) =>
                              newLineWithDash
                                .split(NEW_LINE_START_WITH_DASH)
                                .map((paragraph) => {
                                  paragraph = paragraph.replace(/\s+/g, " "); // Make single line

                                  paragraph = capitalizer(paragraph);
                                  if (options.jsdocDescriptionWithDot)
                                    paragraph = paragraph.replace(
                                      /([\w\p{L}])$/u,
                                      "$1.",
                                    ); // Insert dot if needed

                                  return breakDescriptionToLines(
                                    paragraph,
                                    printWidth,
                                    beginningSpace,
                                  );
                                })
                                .join("\n- "), // NEW_LINE_START_WITH_DASH
                          )
                          .join("\n\n- "), // NEW_PARAGRAPH_START_WITH_DASH
                    )
                    .join(`\n    ${"-".repeat(printWidth / 2)}\n`), // NEW_DASH_LINE
              )
              .join("\n"), // NEW_LINE_START_WITH_NUMBER
        )
        .join("\n\n"); // EMPTY_LINE_SIGNATURE
    })
    .join("\n\n    "); // NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE;

  const dashContent = text.match(/(^|\n)-(.+\n(?!(-)))+/g);

  if (dashContent) {
    dashContent.forEach((content) => {
      text = text.replace(content, content.replace(/((?!(^))\n)/g, "\n  "));
    });
  }

  const numberContent = text.match(/(^|\n)\d+.(.+\n(?!(\d+.)))+/g);

  if (numberContent) {
    numberContent.forEach((content) => {
      text = text.replace(content, content.replace(/((?!(^))\n)/g, "\n   "));
    });
  }

  if (codes) {
    text = text.split(CODE).reduce((pre, cur, index) => {
      return `${pre}${cur.trim()}${
        codes[index]
          ? `\n\n${format(codes[index], {
              ...options,
              parser: "markdown",
            }).trim()}\n\n`
          : ""
      }`;
    }, "");
  }

  if (intendedCodes.length > 0) {
    text = text.split(CODE_INDENTED).reduce((pre, cur, index) => {
      let result = intendedCodes?.[index] || "";
      const beginningSpace = " ".repeat(4);

      if (result) {
        // Remove two space from lines, maybe added previous format
        result = formatCode(result, beginningSpace, options).trim();
      }
      return `${pre}${cur.trim()}${result ? `\n\n    ${result}\n\n` : ""}`;
    }, "");
  }

  if (tables.length > 0) {
    text = text.split(TABLE).reduce((pre, cur, index) => {
      let result = tables?.[index] || "";
      if (result) {
        result = format(result, {
          ...options,
          parser: "markdown",
        }).trim();
      }
      return `${pre}${cur.trim()}${result ? `\n\n${result}\n\n` : ""}`;
    }, "");
  }

  text = text.trim().slice(tagStringLength);

  return text;
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

export {
  EMPTY_LINE_SIGNATURE,
  NEW_LINE_START_WITH_DASH,
  NEW_PARAGRAPH_START_WITH_DASH,
  NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE,
  descriptionEndLine,
  FormatOptions,
  formatDescription,
};

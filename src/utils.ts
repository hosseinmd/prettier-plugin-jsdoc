import { format, Options } from "prettier";
import { TAGS_NEED_FORMAT_DESCRIPTION } from "./roles";
import { DESCRIPTION, EXAMPLE, TODO } from "./tags";
import { Comment } from "comment-parser";

const EMPTY_LINE_SIGNATURE = "a2@1093NmY^5!~#sdEKHuhPOK*&baSIGNATURE1";
const NEW_LINE_START_THREE_SPACE_SIGNATURE =
  "l2@_0^3N)Y^5!~^sd*KHuh+O~*;vlSIGNATURE2";
const NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE =
  "l2@_0^s43fb64ds2Huh+O~*;vlSIGNATURE3";

function convertToModernArray(type: string): string {
  if (!type) {
    return type;
  }

  const maxWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^<>]+)>)/g;
  const minWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^.]+)>)/g;
  type = type.replace(".<", "<");

  function replaceArray(value: string): string {
    let regular = maxWrapper;
    let result = regular.exec(value);

    if (!result) {
      regular = minWrapper;
      result = regular.exec(value);
    }

    if (!result) {
      return value;
    }
    const typeName = result[2];

    value = value.replace(regular, `${typeName}[]`);
    return replaceArray(value);
  }

  return replaceArray(type);
}

function formatType(type: string, options?: Options): string {
  try {
    let pretty = type.replace("*", "any");
    const TYPE_START = "type name = ";

    pretty = format(`${TYPE_START}${pretty}`, {
      ...options,
      parser: "typescript",
    });
    pretty = pretty.slice(TYPE_START.length);

    pretty = pretty.replace(/[;\n]*$/g, "");

    return pretty;
  } catch (error) {
    // console.log("jsdoc-parser", error);
    return type;
  }
}

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

function addStarsToTheBeginningOfTheLines(comment: string): string {
  if (numberOfAStringInString(comment.trim(), "\n") === 0) {
    return `* ${comment.trim()} `;
  }

  return `*${comment.replace(/((?!\n$)\n)/g, "\n * ")}\n `;
}

function numberOfAStringInString(string: string, search: string | RegExp) {
  return (string.match(new RegExp(search, "g")) || []).length;
}

/**
 * Trim, make single line with capitalized text. Insert dot if flag for it is
 * set to true and last character is a word character
 *
 * @private
 * @param {Boolean} insertDot Flag for dot at the end of text
 */
function formatDescription(
  tag: string,
  text: string,
  insertDot: boolean
): string {
  text = text || "";
  text = text.replace(/^[\W]/g, "");
  text = text.trim();

  if (!TAGS_NEED_FORMAT_DESCRIPTION.includes(tag)) {
    return text;
  }

  if (!text) return text;

  text = text.replace(
    /(\n\n\s\s\s+)|(\n\s+\n\s\s\s+)/g,
    NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE
  ); // Add a signature for new paragraph start with three space
  text = text.replace(/(\n\n)|(\n\s+\n)/g, EMPTY_LINE_SIGNATURE); // Add a signature for empty line and use that later
  text = text.replace(/\n\s\s\s+/g, NEW_LINE_START_THREE_SPACE_SIGNATURE); // Add a signature for new line start with three space
  text = text.replace(/\s\s+/g, " "); // Avoid multiple spaces
  text = text.replace(/\n/g, " "); // Make single line

  if (insertDot) text = text.replace(/(\w)(?=$)/g, "$1."); // Insert dot if needed
  text = text[0].toUpperCase() + text.slice(1); // Capitalize
  return text || "";
}

function convertCommentDescToDescTag(parsed: Comment): void {
  if (!parsed.description) {
    return;
  }

  const Tag = parsed.tags.find(({ tag }) => tag.toLowerCase() === DESCRIPTION);
  let { description = "" } = Tag || {};

  description += parsed.description;

  if (Tag) {
    Tag.description = description;
  } else {
    parsed.tags.push({ tag: DESCRIPTION, description } as any);
  }
}

export {
  EMPTY_LINE_SIGNATURE,
  NEW_LINE_START_THREE_SPACE_SIGNATURE,
  NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE,
  convertToModernArray,
  formatType,
  descriptionEndLine,
  addStarsToTheBeginningOfTheLines,
  convertCommentDescToDescTag,
  formatDescription,
};

import { DESCRIPTION } from "./tags";
import { Comment } from "comment-parser";
import { JsdocOptions } from "./types";
import {
  capitalizer,
  trimEmptyLines,
  trimTrailingSpaces,
  tryFormat,
} from "./utils";

interface FormatOptions {
  firstLinePrintWidth?: number;
}

/**
 * Trim, make single line with capitalized text. Insert dot if flag for it is
 * set to true and last character is a word character
 *
 * @private
 */
function formatDescription(
  text: string,
  options: JsdocOptions,
  formatOptions?: FormatOptions,
): string {
  text = trimTrailingSpaces(text);
  text = trimEmptyLines(text);
  text = capitalizer(text);

  if (!text) return text;

  const { printWidth } = options;
  let { firstLinePrintWidth = printWidth } = formatOptions ?? {};
  if (firstLinePrintWidth > printWidth) {
    firstLinePrintWidth = printWidth;
  }

  const shortFirstLine =
    firstLinePrintWidth > 1 &&
    firstLinePrintWidth < printWidth &&
    !needsItsOwnLine(text);

  if (shortFirstLine) {
    const prefix = "Z".repeat(printWidth - firstLinePrintWidth - 1) + " ";
    text = prefix + text;

    text =
      tryFormat(text, {
        ...options,
        parser: "markdown",
        proseWrap: "always",
      }) ?? text;

    text = text.replace(/^Z+[ ]*/, "");
  } else {
    text =
      tryFormat(text, {
        ...options,
        parser: "markdown",
        proseWrap: "always",
      }) ?? text;
  }

  return trimEmptyLines(text);
}

function needsItsOwnLine(markdown: string): boolean {
  return (
    // list
    /^\s*(?:\d+[.)]|[*])[\s-]/.test(markdown) ||
    // code block
    /^\s*```.*[\r\n]/.test(markdown) ||
    // heading
    /^\s*(?:#{1,6}.*|[^\s=-].*\n(?:===+|---+))/.test(markdown)
  );
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

export { convertCommentDescToDescTag, formatDescription };

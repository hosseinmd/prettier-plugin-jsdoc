import { Tag } from "comment-parser";
import { format, Options } from "prettier";
import { formatDescription } from "./descriptionFormatter";
import { DESCRIPTION, EXAMPLE, TODO } from "./tags";
import {
  TAGS_NEED_FORMAT_DESCRIPTION,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { JsdocOptions } from "./types";
import {
  getFirstLine,
  getLastLine,
  trimEmptyLines,
  trimIndentation,
  trimTrailingSpaces,
  prefixLinesWith,
} from "./utils";

function stringifyCommentContent(
  groups: Tag[][],
  options: JsdocOptions,
): string {
  const {
    printWidth,
    jsdocSpaces,
    jsdocVerticalAlignment,
    jsdocDescriptionTag,
    jsdocKeepUnParseAbleExampleIndent,
  } = options;

  const shouldAlign = (tag: string) =>
    jsdocVerticalAlignment && TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);

  interface TagStringifyResult {
    value: string;
    insertLineBefore?: boolean;
    insertLineAfter?: boolean;
  }
  function stringifyTag(t: Tag, alignment: AlignmentInfo): TagStringifyResult {
    const { tag, description } = t;

    if (tag === DESCRIPTION && !jsdocDescriptionTag) {
      return stringifyCommentDescription(description);
    } else if (tag === EXAMPLE) {
      return stringifyExample(description);
    } else {
      return stringifyOtherTag(t, alignment);
    }
  }
  function stringifyCommentDescription(
    description: string,
  ): TagStringifyResult {
    return {
      value: formatDescription(description, options),
      insertLineBefore: true,
      insertLineAfter: true,
    };
  }
  function stringifyExample(description: string): TagStringifyResult {
    let tagString = "@example";

    const captionRegex = /^\s*<caption>([\s\S]*?)<\/caption>/i;
    const exampleCaption = captionRegex.exec(description);
    if (exampleCaption) {
      description = description.slice(exampleCaption[0].length);
      tagString += ` <caption>${exampleCaption[1].trim()}</caption>`;
    }

    description = trimIndentation(trimTrailingSpaces(description));

    const EXAMPLE_CODE_INDENT = " ".repeat(2);

    const examplePrintWith = printWidth - EXAMPLE_CODE_INDENT.length;

    let formattedExample: string | undefined;

    // try JSON formatting
    if (formattedExample === undefined && /^\s*\{/.test(description)) {
      formattedExample = tryFormat(description, {
        ...options,
        parser: "json",
        printWidth: examplePrintWith,
      });
    }

    // try current language formatting
    if (formattedExample === undefined) {
      formattedExample = tryFormat(description, {
        ...options,
        printWidth: examplePrintWith,
      });
    }

    // unformatted
    if (formattedExample === undefined) {
      if (jsdocKeepUnParseAbleExampleIndent) {
        formattedExample = description;
      } else {
        formattedExample = description
          .split(/\n/g)
          .map((line) => line.trim())
          .join("\n");
      }
    }

    // some formatters add empty lines
    formattedExample = trimEmptyLines(formattedExample);

    // add indentation
    formattedExample = prefixLinesWith(
      formattedExample,
      EXAMPLE_CODE_INDENT,
      true,
    );

    tagString += "\n" + formattedExample;

    return {
      value: tagString,
      insertLineAfter: true,
    };
  }
  function stringifyOtherTag(
    { tag, type, name, description }: Tag,
    { maxTypeOffset, maxNameOffset, maxDescOffset }: AlignmentInfo,
  ): TagStringifyResult {
    let tagString = `@${tag}`;

    const doAlign = shouldAlign(tag);
    const withSpace = () => tagString.length + jsdocSpaces;
    const getTypeOffset = () => (doAlign ? maxTypeOffset : withSpace());
    const getNameOffset = () => (doAlign ? maxNameOffset : withSpace());
    const getDescOffset = () => (doAlign ? maxDescOffset : withSpace());

    const padLength = (length: number): void => {
      tagString = tagString.padEnd(length, " ");
    };

    // add type
    if (type) {
      padLength(getTypeOffset());
      tagString += `{${type}}`;
    }

    // add name
    if (name) {
      padLength(getNameOffset());
      tagString += name;
    }

    // add description
    if (description) {
      if (!TAGS_NEED_FORMAT_DESCRIPTION.includes(tag)) {
        padLength(getDescOffset());
        tagString += description;
      } else {
        const extraIndentation = tag !== DESCRIPTION;
        const extraIndentationStr = extraIndentation ? " ".repeat(2) : "";

        const beforeDescWidth = doAlign
          ? getDescOffset()
          : getLastLine(tagString).length + jsdocSpaces;

        if (beforeDescWidth >= printWidth) {
          tagString +=
            "\n" +
            extraIndentationStr +
            formatDescription(description, options, { extraIndentation });
        } else {
          const formatted = formatDescription(description, options, {
            firstLinePrintWidth: printWidth - beforeDescWidth,
            extraIndentation,
          });

          const firstLine = getFirstLine(formatted);
          if (!firstLine) {
            // empty first line
            tagString += formatted;
          } else if (beforeDescWidth + firstLine.length <= printWidth) {
            // formatted description fits within print width
            padLength(getDescOffset());
            tagString += formatted;
          } else {
            // first line is too long
            tagString += "\n" + extraIndentationStr + formatted;
          }
        }
      }
    }

    return {
      value: tagString,
      insertLineAfter: tag === TODO,
    };
  }

  let result = "";
  let emptyLineAfter = false;
  groups.forEach((tags) => {
    const alignment = createAlignmentInfo(tags, options);
    const stringifyResults = tags.map((tag) => stringifyTag(tag, alignment));

    // empty lines between groups
    stringifyResults[0].insertLineBefore = true;
    stringifyResults[stringifyResults.length - 1].insertLineAfter = true;

    for (const {
      value,
      insertLineBefore,
      insertLineAfter,
    } of stringifyResults) {
      result += "\n";
      if (insertLineBefore && !emptyLineAfter) {
        result += "\n";
      }
      result += value;
      if (insertLineAfter) {
        result += "\n";
        emptyLineAfter = true;
      } else {
        emptyLineAfter = false;
      }
    }
  });

  return trimEmptyLines(result);
}

function tryFormat(source: string, options?: Options): string | undefined {
  try {
    return format(source, options);
  } catch (error) {
    return undefined;
  }
}

interface AlignmentInfo {
  readonly maxTypeOffset: number;
  readonly maxNameOffset: number;
  readonly maxDescOffset: number;
}
const EMPTY_ALIGNMENT_INFO: AlignmentInfo = {
  maxTypeOffset: 0,
  maxNameOffset: 0,
  maxDescOffset: 0,
};
function createAlignmentInfo(
  tags: Tag[],
  { jsdocVerticalAlignment, jsdocSpaces }: JsdocOptions,
): AlignmentInfo {
  if (!jsdocVerticalAlignment) {
    return EMPTY_ALIGNMENT_INFO;
  }

  const shouldAlign = (tag: string) =>
    jsdocVerticalAlignment && TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);

  tags = tags.filter(({ tag }) => shouldAlign(tag));

  if (tags.length === 0) {
    return EMPTY_ALIGNMENT_INFO;
  }

  const maxTag = Math.max(...tags.map((t) => (t.tag || "").length));
  const maxType = Math.max(...tags.map((t) => (t.type || "").length));
  const maxName = Math.max(...tags.map((t) => (t.name || "").length));

  const typeOff = "@".length + maxTag + jsdocSpaces;
  const nameOff = typeOff + (maxType ? maxType + "{}".length + jsdocSpaces : 0);
  const descOff = nameOff + (maxName ? maxName + jsdocSpaces : 0);

  return {
    maxTypeOffset: typeOff,
    maxNameOffset: nameOff,
    maxDescOffset: descOff,
  };
}

export { stringifyCommentContent };

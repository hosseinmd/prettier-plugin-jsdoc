import { Tag } from "comment-parser";
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
  tryFormat,
} from "./utils";

interface TagStringifyResult {
  value: string;
  insertLineBefore?: boolean;
  insertLineAfter?: boolean;
}
function stringifyTag(
  t: Tag,
  alignment: AlignmentInfo,
  options: JsdocOptions,
): TagStringifyResult {
  const { tag, description } = t;

  if (tag === DESCRIPTION && !options.jsdocDescriptionTag) {
    return stringifyCommentDescription(description, options);
  } else if (tag === EXAMPLE) {
    return stringifyExample(t, options);
  } else {
    return stringifyRegularTag(t, alignment, options);
  }
}
function stringifyCommentDescription(
  description: string,
  options: JsdocOptions,
): TagStringifyResult {
  return {
    value: formatDescription(description, options),
    insertLineBefore: true,
    insertLineAfter: true,
  };
}
function stringifyExample(
  { description }: Tag,
  options: JsdocOptions,
): TagStringifyResult {
  let tagString = "@example";

  const captionRegex = /^\s*<caption>([\s\S]*?)<\/caption>/i;
  const exampleCaption = captionRegex.exec(description);
  if (exampleCaption) {
    description = description.slice(exampleCaption[0].length);
    tagString += ` <caption>${exampleCaption[1].trim()}</caption>`;
  }

  description = trimIndentation(trimTrailingSpaces(description));

  const EXAMPLE_CODE_INDENT = " ".repeat(2);

  const examplePrintWith = options.printWidth - EXAMPLE_CODE_INDENT.length;

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
    if (options.jsdocKeepUnParseAbleExampleIndent) {
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
function stringifyRegularTag(
  { tag, type, name, description }: Tag,
  { maxTypeOffset, maxNameOffset, maxDescOffset }: AlignmentInfo,
  options: JsdocOptions,
): TagStringifyResult {
  let tagString = `@${tag}`;

  const doAlign =
    options.jsdocVerticalAlignment && TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);
  const addSpacesBefore = (element: "type" | "name" | "desc"): void => {
    if (!doAlign) {
      tagString += " ".repeat(options.jsdocSpaces);
    } else {
      if (element === "type") {
        tagString = tagString.padEnd(maxTypeOffset);
      } else if (element === "name") {
        tagString = tagString.padEnd(maxNameOffset);
      } else {
        tagString = tagString.padEnd(maxDescOffset);
      }
    }
  };

  // add type
  if (type) {
    addSpacesBefore("type");
    tagString += `{${type}}`;
  }

  // add name
  if (name) {
    addSpacesBefore("name");
    tagString += name;
  }

  // add description
  if (description) {
    addSpacesBefore("desc");

    if (!TAGS_NEED_FORMAT_DESCRIPTION.includes(tag)) {
      tagString += description;
    } else {
      const extraIndentation = tag !== DESCRIPTION;
      const extraIndentationStr = extraIndentation ? " ".repeat(2) : "";

      /** The width (in spaces) of the line before the description. */
      const beforeDescWidth = getLastLine(tagString).length;

      if (beforeDescWidth >= options.printWidth) {
        // the tag is already over printWidth -> add a line break
        tagString +=
          "\n" +
          extraIndentationStr +
          formatDescription(description, options, { extraIndentation });
      } else {
        // The description can potentially fit being appended to the current tag string
        const formatted = formatDescription(description, options, {
          firstLinePrintWidth: options.printWidth - beforeDescWidth,
          extraIndentation,
        });

        const firstLine = getFirstLine(formatted);
        if (!firstLine) {
          // empty first line
          tagString += formatted;
        } else if (beforeDescWidth + firstLine.length <= options.printWidth) {
          // formatted description fits within print width
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

function stringifyCommentContent(
  groups: Tag[][],
  options: JsdocOptions,
): string {
  let result = "";
  let emptyLineAfter = false;
  groups.forEach((tags) => {
    const alignment = createAlignmentInfo(tags, options);
    const stringifyResults = tags.map((tag) =>
      stringifyTag(tag, alignment, options),
    );

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

  tags = tags.filter(({ tag }) => TAGS_VERTICALLY_ALIGN_ABLE.includes(tag));

  if (tags.length === 0) {
    return EMPTY_ALIGNMENT_INFO;
  }

  const maxTag = Math.max(...tags.map((t) => t.tag.length));
  const maxType = Math.max(...tags.map((t) => t.type.length));
  const maxName = Math.max(...tags.map((t) => t.name.length));

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

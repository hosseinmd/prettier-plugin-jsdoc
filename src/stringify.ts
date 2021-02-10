import { Tag } from "comment-parser";
import { format } from "prettier";
import { formatDescription, descriptionEndLine } from "./descriptionFormatter";
import { DESCRIPTION, EXAMPLE, MEMBEROF, SEE, SPACE_TAG_DATA } from "./tags";
import { TAGS_VERTICALLY_ALIGN_ABLE } from "./roles";
import { JsdocOptions } from "./types";

function stringifyTag(
  { name, description, type, tag }: Tag,
  options: JsdocOptions,
  { maxTagLength, maxTypeLength, maxNameLength }: MaxLengthInfo,
): string {
  if (tag === SPACE_TAG_DATA.tag) {
    return "";
  }

  let tagString = "";

  const {
    printWidth,
    jsdocSpaces,
    jsdocVerticalAlignment,
    jsdocDescriptionTag,
    jsdocKeepUnParseAbleExampleIndent,
  } = options;
  const gap = " ".repeat(jsdocSpaces);

  let tagTitleGapAdj = 0;
  let tagTypeGapAdj = 0;
  let tagNameGapAdj = 0;
  let descGapAdj = 0;

  if (jsdocVerticalAlignment && TAGS_VERTICALLY_ALIGN_ABLE.includes(tag)) {
    if (tag) tagTitleGapAdj += maxTagLength - tag.length;
    else if (maxTagLength) descGapAdj += maxTagLength + gap.length;

    if (type) tagTypeGapAdj += maxTypeLength - type.length;
    else if (maxTypeLength) descGapAdj += maxTypeLength + gap.length;

    if (name) tagNameGapAdj += maxNameLength - name.length;
    else if (maxNameLength) descGapAdj = maxNameLength + gap.length;
  }

  const useTagTitle = tag !== DESCRIPTION || jsdocDescriptionTag;

  if (useTagTitle) {
    tagString += `@${tag}${" ".repeat(tagTitleGapAdj || 0)}`;
  }
  if (type) {
    tagString += gap + `{${type}}` + " ".repeat(tagTypeGapAdj);
  }
  if (name) tagString += `${gap}${name}${" ".repeat(tagNameGapAdj)}`;

  // Add description (complicated because of text wrap)
  if (description && tag !== EXAMPLE) {
    if (useTagTitle) tagString += gap + " ".repeat(descGapAdj);
    if ([MEMBEROF, SEE].includes(tag)) {
      // Avoid wrapping
      tagString += description;
    } else {
      const [, firstWord] = /^\s*(\S+)/.exec(description) || ["", ""];
      if (tagString.length + firstWord.length > printWidth) {
        // the tag is already longer than we are allowed to, so let's start at a new line
        tagString += "\n  " + formatDescription(tag, description, options);
      } else {
        // append the description to the tag
        tagString += formatDescription(tag, description, options, {
          firstLinePrintWidth: printWidth - tagString.length,
        });
      }
    }
  }

  // Try to use prettier on @example tag description
  if (tag === EXAMPLE) {
    const exampleCaption = description.match(/<caption>([\s\S]*?)<\/caption>/i);

    if (exampleCaption) {
      description = description.replace(exampleCaption[0], "");
      tagString = `${tagString} ${exampleCaption[0]}`;
    }

    try {
      let formattedExample = "";
      const examplePrintWith = printWidth - "  ".length;

      description = description.replace(/\n[^\S\r\n]{2}/g, "\n"); // Remove two space from lines, maybe added previous format

      // If example is a json
      if (description.trim().startsWith("{")) {
        formattedExample = format(description || "", {
          ...options,
          parser: "json",
          printWidth: examplePrintWith,
        });
      } else {
        formattedExample = format(description || "", {
          ...options,
          printWidth: examplePrintWith,
        });
      }

      tagString += formattedExample.replace(/(^|\n)/g, "\n  "); // Add tow space to start of lines
      tagString = tagString.slice(0, tagString.length - 3);
    } catch (err) {
      tagString += "\n";
      tagString += description
        .split("\n")
        .map((l) => `  ${jsdocKeepUnParseAbleExampleIndent ? l : l.trim()}`)
        .join("\n");
    }
  }

  return tagString;
}

function stringify(tags: Tag[], options: JsdocOptions): string {
  const lines: string[] = [];
  const lastLineIsEmpty = () =>
    lines.length > 0 && lines[lines.length - 1] === "";

  const maxLengthInfo = options.jsdocVerticalAlignment
    ? getMaxLengthInfo(tags)
    : EMPTY_MAX_LENGTH_INFO;

  for (const tag of tags) {
    const tagString = stringifyTag(tag, options, maxLengthInfo);

    lines.push(tagString);

    // Add empty line after some tags
    const extraLine = descriptionEndLine({
      description: tagString,
      tag: tag.tag,
    });

    if (extraLine && !lastLineIsEmpty()) {
      lines.push("");
    }
  }

  // remove first empty line
  if (lines.length > 0 && lines[0] === "") {
    lines.slice(0, 1);
  }

  // remove last empty line
  if (lastLineIsEmpty()) {
    lines.pop();
  }

  return lines.join("\n");
}

interface MaxLengthInfo {
  readonly maxTagLength: number;
  readonly maxTypeLength: number;
  readonly maxNameLength: number;
}
const EMPTY_MAX_LENGTH_INFO: MaxLengthInfo = {
  maxTagLength: 0,
  maxTypeLength: 0,
  maxNameLength: 0,
};
function getMaxLengthInfo(tags: Tag[]): MaxLengthInfo {
  let maxTagLength = 0;
  let maxTypeLength = 0;
  let maxNameLength = 0;

  for (const { tag, type, name } of tags) {
    if (TAGS_VERTICALLY_ALIGN_ABLE.includes(tag)) {
      maxTagLength = Math.max(maxTagLength, tag.length);
      maxTypeLength = Math.max(maxTypeLength, type.length);
      maxNameLength = Math.max(maxNameLength, name.length);
    }
  }

  return { maxTagLength, maxTypeLength, maxNameLength };
}

export { stringify };

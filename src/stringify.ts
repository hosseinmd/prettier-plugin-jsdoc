import { Tag } from "comment-parser";
import { format } from "prettier";
import { formatDescription, descriptionEndLine } from "./descriptionFormatter";
import { DESCRIPTION, EXAMPLE, MEMBEROF, SEE, SPACE_TAG_DATA } from "./tags";
import { TAGS_VERTICALLY_ALIGN_ABLE } from "./roles";
import { JsdocOptions } from "./types";

/**
 * @param {string} a __very__ important!
 * @param {string} b _less_ important...
 */
const stringify = (
  { name, description, type, tag }: Tag,
  tagIndex: number,
  finalTagsArray: Tag[],
  options: JsdocOptions,
  maxTagTitleLength: number,
  maxTagTypeNameLength: number,
  maxTagNameLength: number,
): string => {
  let tagString = "\n";

  if (tag === SPACE_TAG_DATA.tag) {
    return tagString;
  }

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
    if (tag) tagTitleGapAdj += maxTagTitleLength - tag.length;
    else if (maxTagTitleLength) descGapAdj += maxTagTitleLength + gap.length;

    if (type) tagTypeGapAdj += maxTagTypeNameLength - type.length;
    else if (maxTagTypeNameLength)
      descGapAdj += maxTagTypeNameLength + gap.length;

    if (name) tagNameGapAdj += maxTagNameLength - name.length;
    else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length;
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
          // 1 is `\n` which added to tagString
          tagStringLength: tagString.length - 1,
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

    // Remove two space from lines, maybe added previous format
    if (
      description
        .split("\n")
        .slice(1)
        .every((v) => !v.trim() || v.startsWith("  "))
    ) {
      description = description.replace(/\n[^\S\r\n]{2}/g, "\n");
    }

    try {
      let formattedExample = "";
      const examplePrintWith = printWidth - "  ".length;

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

  // Add empty line after some tags if there is something below
  tagString += descriptionEndLine({
    description: tagString,
    tag,
    isEndTag: tagIndex === finalTagsArray.length - 1,
  });

  return tagString;
};

export { stringify };

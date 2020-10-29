import { Tag } from "comment-parser";
import { format } from "prettier";
import {
  descriptionEndLine,
  EMPTY_LINE_SIGNATURE,
  NEW_LINE_START_THREE_SPACE_SIGNATURE,
  NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE,
} from "./utils";
import { DESCRIPTION, EXAMPLE, MEMBEROF, SEE } from "./tags";
import { TAGS_VERTICALLY_ALIGN_ABLE } from "./roles";
import { JsdocOptions, PrettierComment } from "./types";

const stringify = (
  { name, description, type, tag }: Tag,
  tagIndex: number,
  finalTagsArray: Tag[],
  options: JsdocOptions,
  comment: PrettierComment,
  maxTagTitleLength: number,
  maxTagTypeNameLength: number,
  maxTagNameLength: number
): string => {
  const {
    loc: {
      start: { column },
    },
  } = comment;
  const gap = " ".repeat(options.jsdocSpaces);
  const { printWidth = 80 } = options;

  let tagTitleGapAdj = 0;
  let tagTypeGapAdj = 0;
  let tagNameGapAdj = 0;
  let descGapAdj = 0;

  if (
    options.jsdocVerticalAlignment &&
    TAGS_VERTICALLY_ALIGN_ABLE.includes(tag)
  ) {
    if (tag) tagTitleGapAdj += maxTagTitleLength - tag.length;
    else if (maxTagTitleLength) descGapAdj += maxTagTitleLength + gap.length;

    if (type) tagTypeGapAdj += maxTagTypeNameLength - type.length;
    else if (maxTagTypeNameLength)
      descGapAdj += maxTagTypeNameLength + gap.length;

    if (name) tagNameGapAdj += maxTagNameLength - name.length;
    else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length;
  }

  const useTagTitle = tag !== DESCRIPTION || options.jsdocDescriptionTag;
  let tagString = "\n";

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
      // Wrap tag description
      const beginningSpace = tag === DESCRIPTION ? "" : "    "; // google style guide space
      const marginLength = tagString.length;
      let maxWidth = printWidth - column - 3; // column is location of comment, 3 is ` * `

      if (marginLength >= maxWidth) {
        maxWidth = marginLength;
      }

      const resolveDescription = `${tagString}${description}`;

      tagString = resolveDescription
        .split(NEW_PARAGRAPH_START_THREE_SPACE_SIGNATURE)
        .map((newParagraph) => {
          return newParagraph
            .split(EMPTY_LINE_SIGNATURE)
            .map((paragraph) => {
              paragraph = paragraph[0].toUpperCase() + paragraph.slice(1); // Capitalize
              return paragraph
                .split(NEW_LINE_START_THREE_SPACE_SIGNATURE)
                .map((desContent) => {
                  desContent = desContent.trim();

                  if (!desContent) {
                    return desContent;
                  }
                  const extraLastLineWidth = 10;
                  let result = "";
                  while (desContent.length > maxWidth + extraLastLineWidth) {
                    let sliceIndex = desContent.lastIndexOf(" ", maxWidth);
                    if (sliceIndex === -1) sliceIndex = maxWidth;
                    result += desContent.substring(0, sliceIndex);
                    desContent = desContent.substring(sliceIndex + 1);
                    desContent = `\n${beginningSpace}${desContent}`;
                  }

                  result += desContent;

                  return result;
                })
                .join("\n    ");
            })
            .join("\n\n");
        })
        .join("\n\n    ");

      tagString = tagString ? `\n${tagString}` : tagString;
    }
  }

  // Try to use prettier on @example tag description
  if (tag === EXAMPLE) {
    try {
      const formattedExample = format(description || "", options);
      tagString += formattedExample.replace(/(^|\n)/g, "\n  ");
      tagString = tagString.slice(0, tagString.length - 3);
    } catch (err) {
      tagString += "\n";
      tagString += description
        .split("\n")
        .map(
          (l) => `  ${options.jsdocKeepUnParseAbleExampleIndent ? l : l.trim()}`
        )
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

import { Tag } from "comment-parser";
import { format } from "prettier";
import { formatDescription, descriptionEndLine } from "./descriptionFormatter";
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
  maxTagNameLength: number,
): string => {
  const {
    loc: {
      start: { column },
    },
  } = comment;
  const gap = " ".repeat(options.jsdocSpaces);

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
      const resolveDescription = formatDescription(
        tag,
        description,
        tagString,
        column,
        options,
      );

      tagString = `${tagString}${resolveDescription}`;
      // tagString = tagString ? `\n${tagString}` : tagString;
    }
  }

  // Try to use prettier on @example tag description
  if (tag === EXAMPLE) {
    const exampleCaption = description.match(
      /<caption>(((?!(<\/caption>))[\s\S])*)<\/caption>/i,
    );

    if (exampleCaption) {
      description = description.replace(exampleCaption[0], "");
      tagString = `${tagString} ${exampleCaption[0]}`;
    }

    try {
      let formattedExample = "";
      // if example is a json
      if (description.trim().startsWith("{")) {
        formattedExample = format(description || "", {
          ...options,
          parser: "json",
        });
      } else {
        formattedExample = format(description || "", options);
      }
      tagString += formattedExample.replace(/(^|\n)/g, "\n  ");
      tagString = tagString.slice(0, tagString.length - 3);
    } catch (err) {
      tagString += "\n";
      tagString += description
        .split("\n")
        .map(
          (l) =>
            `  ${options.jsdocKeepUnParseAbleExampleIndent ? l : l.trim()}`,
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

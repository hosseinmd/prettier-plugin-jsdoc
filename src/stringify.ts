import { Spec } from "comment-parser/src/primitives";
import { formatDescription, descriptionEndLine } from "./descriptionFormatter";
import { DESCRIPTION, EXAMPLE, SPACE_TAG_DATA } from "./tags";
import {
  TAGS_ORDER,
  TAGS_PEV_FORMATE_DESCRIPTION,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { AllOptions } from "./types";
import { formatCode } from "./utils";

const stringify = (
  { name, description, type, tag }: Spec,
  tagIndex: number,
  finalTagsArray: Spec[],
  options: AllOptions,
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
    tsdoc,
    useTabs,
    tabWidth,
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

  // Try to use prettier on @example tag description
  if (tag === EXAMPLE && !tsdoc) {
    const exampleCaption = description.match(/<caption>([\s\S]*?)<\/caption>/i);

    if (exampleCaption) {
      description = description.replace(exampleCaption[0], "");
      tagString = `${tagString} ${exampleCaption[0]}`;
    }

    const beginningSpace = useTabs ? "\t" : " ".repeat(tabWidth);
    const formattedExample = formatCode(description, beginningSpace, options);
    tagString += formattedExample.startsWith("\n")
      ? formattedExample.trimEnd()
      : "\n" + formattedExample;
  } // Add description (complicated because of text wrap)
  else if (description) {
    if (useTagTitle) tagString += gap + " ".repeat(descGapAdj);
    if (
      TAGS_PEV_FORMATE_DESCRIPTION.includes(tag) ||
      !TAGS_ORDER.includes(tag)
    ) {
      // Avoid wrapping
      tagString += description;
    } else {
      const [, firstWord] = /^\s*(\S+)/.exec(description) || ["", ""];
      if (
        tag !== DESCRIPTION &&
        tagString.length + firstWord.length > printWidth
      ) {
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

  // Add empty line after some tags if there is something below
  tagString += descriptionEndLine({
    description: tagString,
    tag,
    isEndTag: tagIndex === finalTagsArray.length - 1,
  });

  return tagString;
};

export { stringify };

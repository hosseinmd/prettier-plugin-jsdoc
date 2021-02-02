import { Tag } from "comment-parser";
import { formatDescription } from "./descriptionFormatter";
import { DESCRIPTION, EXAMPLE, TODO } from "./tags";
import {
  TAGS_NEED_FORMAT_DESCRIPTION,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { JsdocOptions } from "./types";
import {
  trimEmptyLines,
  trimIndentation,
  trimTrailingSpaces,
  prefixLinesWith,
  getFirstLine,
  getLastLine,
  tryFormat,
} from "./utils";

function stringifyJSDoc(tags: Tag[], options: JsdocOptions): string {
  const {
    printWidth,
    jsdocSpaces,
    jsdocVerticalAlignment,
    jsdocDescriptionTag,
    jsdocKeepUnParseAbleExampleIndent,
  } = options;

  const shouldAlign = (tag: string) =>
    jsdocVerticalAlignment && TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);

  const toAlignTags = tags.filter(({ tag }) => shouldAlign(tag));
  const MAX_TAG_LENGTH = Math.max(
    ...toAlignTags.map(({ tag }) => (tag || "").length),
  );
  const MAX_TYPE_LENGTH = Math.max(
    ...toAlignTags.map(({ type }) => (type || "").length),
  );
  const MAX_NAME_LENGTH = Math.max(
    ...toAlignTags.map(({ name }) => (name || "").length),
  );

  const TYPE_OFFSET = "@".length + MAX_TAG_LENGTH + jsdocSpaces;
  const NAME_OFFSET =
    TYPE_OFFSET +
    (MAX_TYPE_LENGTH ? MAX_TYPE_LENGTH + "{}".length + jsdocSpaces : 0);
  const DESC_OFFSET =
    NAME_OFFSET + (MAX_NAME_LENGTH ? MAX_NAME_LENGTH + jsdocSpaces : 0);

  interface TagStringifyResult {
    value: string;
    insertLineBefore?: boolean;
    insertLineAfter?: boolean;
  }
  function stringifyTag({
    tag,
    type,
    name,
    description,
  }: Tag): TagStringifyResult {
    if (tag === DESCRIPTION && !jsdocDescriptionTag) {
      return {
        value: formatDescription(description, options),
        insertLineAfter: true,
      };
    } else if (tag === EXAMPLE) {
      let tagString = "@example";

      const captionRegex = /^\s*<caption>([\s\S]*?)<\/caption>/i;
      const exampleCaption = captionRegex.exec(description);
      if (exampleCaption) {
        description = description.slice(exampleCaption[0].length);
        tagString += ` <caption>${exampleCaption[1].trim()}</caption>`;
      }

      description = trimIndentation(trimTrailingSpaces(description));

      const EXAMPLE_CODE_INDENT = "  ";

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
    } else {
      let tagString = `@${tag}`;

      const padLength = (length: number): void => {
        tagString = tagString.padEnd(length, " ");
      };

      const getTypeOffset = () =>
        shouldAlign(tag) ? TYPE_OFFSET : tagString.length + jsdocSpaces;
      const getNameOffset = () =>
        shouldAlign(tag) ? NAME_OFFSET : tagString.length + jsdocSpaces;
      const getDescOffset = () =>
        shouldAlign(tag) ? DESC_OFFSET : tagString.length + jsdocSpaces;

      if (type) {
        padLength(getTypeOffset());
        tagString += `{${type}}`;
      }
      if (name) {
        padLength(getNameOffset());
        tagString += name;
      }

      if (description) {
        if (!TAGS_NEED_FORMAT_DESCRIPTION.includes(tag)) {
          padLength(getDescOffset());
          tagString += description;
        } else {
          const beforeDescWidth = shouldAlign(tag)
            ? getDescOffset()
            : getLastLine(tagString).length + jsdocSpaces;
          if (beforeDescWidth >= printWidth) {
            tagString += "\n" + formatDescription(description, options);
          } else {
            const formatted = formatDescription(description, options, {
              firstLinePrintWidth: printWidth - beforeDescWidth,
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
              // the first line is too long
              tagString += "\n" + formatted;
            }
          }
        }
      }

      return {
        value: tagString,
        insertLineAfter: tag === TODO,
      };
    }
  }

  let result = "";
  let emptyLineAfter = false;
  tags.forEach((tag) => {
    const { value, insertLineBefore, insertLineAfter } = stringifyTag(tag);

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
  });

  return trimEmptyLines(result);
}

export { stringifyJSDoc };

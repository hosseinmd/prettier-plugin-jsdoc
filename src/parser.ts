import commentParser from "comment-parser";
import {
  addStarsToTheBeginningOfTheLines,
  convertToModernType,
  formatType,
  detectEndOfLine,
} from "./utils";
import { DESCRIPTION } from "./tags";
import {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_GROUP,
  TAGS_IS_CAMEL_CASE,
  TAGS_NAMELESS,
  TAGS_ORDER,
  TAGS_SYNONYMS,
  TAGS_TYPELESS,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { AST, JsdocOptions, PrettierComment } from "./types";
import { stringify } from "./stringify";
import { convertCommentDescToDescTag } from "./descriptionFormatter";
import { Parser } from "prettier";
import { SPACE_TAG_DATA } from "./tags";

/** @link https://prettier.io/docs/en/api.html#custom-parser-api} */
export const getParser = (parser: Parser["parse"]) =>
  function jsdocParser(
    text: string,
    parsers: Parameters<Parser["parse"]>[1],
    options: JsdocOptions,
  ): AST {
    const ast = parser(text, parsers, options) as AST;

    if (!options.jsdocParser) {
      return ast;
    }

    const eol =
      options.endOfLine === "auto" ? detectEndOfLine(text) : options.endOfLine;
    options = { ...options, endOfLine: "lf" };

    /**
     * Control order of tags by weights. Smaller value brings tag higher.
     *
     * @param {String} tagTitle TODO
     * @returns {Number} Tag weight
     */
    function getTagOrderWeight(tag: string): number {
      if (tag === DESCRIPTION && !options.jsdocDescriptionTag) {
        return -1;
      }
      const index = TAGS_ORDER.indexOf(tag);
      return index === -1 ? TAGS_ORDER.indexOf("other") : index;
    }

    ast.comments.forEach((comment) => {
      if (!isBlockComment(comment)) return;

      /** Issue: https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/18 */
      comment.value = comment.value.replace(/^([*]+)/g, "*");

      // Create the full comment string with line ends normalized to \n
      // This means that all following code can assume \n and should only use
      // \n.
      const commentString = `/*${comment.value.replace(/\r\n?/g, "\n")}*/`;

      /**
       * Check if this comment block is a JSDoc. Based on:
       * https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
       */
      if (!/^\/\*\*[\s\S]+?\*\/$/.test(commentString)) return;

      const parsed = commentParser(commentString, {
        dotted_names: false,
        trim: false,
      })[0];

      if (!parsed) {
        // Error on commentParser
        return;
      }

      comment.value = "";

      convertCommentDescToDescTag(parsed);

      let maxTagTitleLength = 0;
      let maxTagTypeNameLength = 0;
      let maxTagNameLength = 0;

      parsed.tags
        // Prepare tags data
        .map(
          ({
            name,
            description,
            type,
            tag,
            source,
            optional,
            default: _default,
            ...restInfo
          }) => {
            /** When space between tag and type missed */
            const tagSticksToType = tag.indexOf("{");
            if (tagSticksToType !== -1 && tag[tag.length - 1] === "}") {
              type = tag.slice(tagSticksToType + 1, -1);
              tag = tag.slice(0, tagSticksToType);
            }

            if (TAGS_ORDER.includes(tag) && !TAGS_IS_CAMEL_CASE.includes(tag)) {
              tag = tag && tag.trim().toLowerCase();
            }

            if (tag in TAGS_SYNONYMS) {
              tag = TAGS_SYNONYMS[tag as keyof typeof TAGS_SYNONYMS];
            }

            const isVerticallyAlignAbleTags = TAGS_VERTICALLY_ALIGN_ABLE.includes(
              tag,
            );

            if (TAGS_NAMELESS.includes(tag) && name) {
              description = `${name} ${description}`;
              name = "";
            }

            if (TAGS_TYPELESS.includes(tag) && type) {
              description = `{${type}} ${description}`;
              type = "";
            }

            if (type) {
              /**
               * Convert optional to standard
               * https://jsdoc.app/tags-type.html#:~:text=Optional%20parameter
               */
              type = type.replace(/[=]$/, () => {
                optional = true;
                return "";
              });

              type = convertToModernType(type);
              type = formatType(type, options);

              if (isVerticallyAlignAbleTags)
                maxTagTypeNameLength = Math.max(
                  maxTagTypeNameLength,
                  type.length,
                );

              // Additional operations on name
              if (name) {
                // Optional tag name
                if (optional) {
                  // Figure out if tag type have default value
                  _default = _default?.trim();
                  if (_default) {
                    description = description
                      .trim()
                      .replace(/[ \t]*Default is `.*`\.?$/, "");
                    if (description && !/[.\n]$/.test(description)) {
                      description += ".";
                    }
                    description += ` Default is \`${_default}\``;
                    name = `[${name}=${_default}]`;
                  } else {
                    name = `[${name}]`;
                  }
                }

                if (isVerticallyAlignAbleTags)
                  maxTagNameLength = Math.max(maxTagNameLength, name.length);
              }
            }

            if (isVerticallyAlignAbleTags) {
              maxTagTitleLength = Math.max(maxTagTitleLength, tag.length);
            }

            description = description || "";
            description = description.trim();

            return {
              ...restInfo,
              name,
              description,
              type,
              tag,
              source,
              default: _default,
              optional,
            } as commentParser.Tag;
          },
        )

        // Group tags
        .reduce<commentParser.Tag[][]>((tagGroups, cur) => {
          if (tagGroups.length === 0 || TAGS_GROUP.includes(cur.tag)) {
            tagGroups.push([]);
          }
          tagGroups[tagGroups.length - 1].push(cur);

          return tagGroups;
        }, [])
        .flatMap((tagGroup, index, tags) => {
          // sort tags within groups
          tagGroup.sort((a, b) => {
            return getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag);
          });

          // add an empty line between groups
          if (tags.length - 1 !== index) {
            tagGroup.push(SPACE_TAG_DATA);
          }

          return tagGroup;
        })
        .filter(({ description, tag }) => {
          if (!description && TAGS_DESCRIPTION_NEEDED.includes(tag)) {
            return false;
          }
          return true;
        })
        // Create final jsDoc string
        .forEach((tagData, tagIndex, finalTagsArray) => {
          comment.value += stringify(
            tagData,
            tagIndex,
            finalTagsArray,
            options,
            comment,
            maxTagTitleLength,
            maxTagTypeNameLength,
            maxTagNameLength,
          );
        });

      comment.value = comment.value.trimEnd();
      if (comment.value) {
        comment.value = addStarsToTheBeginningOfTheLines(comment.value);
      }

      if (eol === "cr") {
        comment.value = comment.value.replace(/\n/g, "\r");
      } else if (eol === "crlf") {
        comment.value = comment.value.replace(/\n/g, "\r\n");
      }
    });

    ast.comments = ast.comments.filter(
      (comment) => !(isBlockComment(comment) && !comment.value),
    );

    return ast;
  };

function isBlockComment(comment: PrettierComment): boolean {
  return comment.type === "CommentBlock" || comment.type === "Block";
}

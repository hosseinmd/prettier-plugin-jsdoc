import commentParser from "comment-parser";
import {
  addStarsToTheBeginningOfTheLines,
  convertToModernArray,
  formatType,
} from "./utils";
import { DESCRIPTION } from "./tags";
import {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_IS_CAMEL_CASE,
  TAGS_NAMELESS,
  TAGS_ORDER,
  TAGS_SYNONYMS,
  TAGS_TYPELESS,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { AST, JsdocOptions } from "./types";
import { stringify } from "./stringify";
import { convertCommentDescToDescTag } from "./descriptionFormatter";

/** @link https://prettier.io/docs/en/api.html#custom-parser-api} */
export const getParser = (parser: any) =>
  function jsdocParser(text: string, parsers: any, options: JsdocOptions): AST {
    const ast = parser(text, parsers, options) as AST;

    if (!options.jsdocParser) {
      return ast;
    }

    /**
     * Control order of tags by weights. Smaller value brings tag higher.
     *
     * @param {String} tagTitle TODO
     * @returns {Number} Tag weight
     */
    function getTagOrderWeight(tagTitle: string): number {
      if (tagTitle === DESCRIPTION && !options.jsdocDescriptionTag) {
        return -1;
      }
      const index = TAGS_ORDER.indexOf(tagTitle);
      return index === -1 ? TAGS_ORDER.indexOf("other") : index;
    }

    ast.comments.forEach((comment) => {
      // Parse only comment blocks
      if (comment.type !== "CommentBlock" && comment.type !== "Block") return;

      /** Issue: https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/18 */
      comment.value = comment.value.replace(/^([*]+)/g, "*");

      const commentString = `/*${comment.value}*/`;

      /**
       * Check if this comment block is a JSDoc. Based on:
       * https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
       */
      if (!commentString.match(/\/\*\*[\s\S]+?\*\//g)) return;

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
            if (tagSticksToType !== -1) {
              type = tag.slice(tagSticksToType + 1, tag.indexOf("}"));
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
              /** Convert optional to standard */
              if (/[?]$/g.test(type)) {
                type = type.replace(/[?]$/g, "");
                optional = true;
              }

              type = convertToModernArray(type);
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
                  if (_default) {
                    description += ` Default is \`${_default}\``;
                  }
                  name = `[${name}]`;
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
            };
          },
        )

        // Sort tags
        .sort((a, b) => getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag))
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
    });

    ast.comments = ast.comments.filter(
      ({ type, value }) =>
        (type !== "CommentBlock" && type !== "Block") || value,
    );

    return ast;
  };

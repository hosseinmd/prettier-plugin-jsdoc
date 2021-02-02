import commentParser from "comment-parser";
import {
  convertToModernType,
  countLines,
  formatType,
  prefixLinesWith,
  trimTrailingSpaces,
} from "./utils";
import { DESCRIPTION } from "./tags";
import {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_IS_CAMEL_CASE,
  TAGS_NAMELESS,
  TAGS_ORDER,
  TAGS_SYNONYMS,
  TAGS_TYPELESS,
} from "./roles";
import { AST, JsdocOptions, PrettierComment } from "./types";
import { stringifyJSDoc } from "./stringify";
import { convertCommentDescToDescTag } from "./descriptionFormatter";
import { Parser } from "prettier";

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

    /**
     * Control order of tags by weights. Smaller value brings tag higher.
     *
     * @param {String} tagTitle
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
      if (!isBlockComment(comment)) return;

      /** Issue: https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/18 */
      comment.value = comment.value.replace(/^([*]+)/g, "*");

      const commentString = `/*${comment.value}*/`;

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

      const commentIndentationWidth = getIndentationWidth(comment, options);
      const CONTENT_PREFIX = " * ";
      const commentContentPrintWidth =
        options.printWidth - commentIndentationWidth - CONTENT_PREFIX.length;

      convertCommentDescToDescTag(parsed);

      const tags = parsed.tags
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
            name = (name || "").trim();
            description = trimTrailingSpaces((description || "").trim());

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
              type = formatType(type, {
                ...options,
                printWidth: commentContentPrintWidth,
              });

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
                    if (description && !/[.\r\n]$/.test(description)) {
                      description += ".";
                    }
                    description += ` Default is \`${_default}\``;
                    name = `[${name}=${_default}]`;
                  } else {
                    name = `[${name}]`;
                  }
                }
              }
            }

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
        // Sort tags
        .sort((a, b) => getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag))
        .filter(({ description, tag }) => {
          if (!description && TAGS_DESCRIPTION_NEEDED.includes(tag)) {
            return false;
          }
          return true;
        });

      const commentContent = stringifyJSDoc(tags, {
        ...options,
        printWidth: commentContentPrintWidth,
      });

      if (commentContent) {
        if (
          countLines(commentContent) === 1 &&
          commentIndentationWidth + `/**  */`.length + commentContent.length <=
            options.printWidth
        ) {
          comment.value = `* ${commentContent} `;
        } else {
          comment.value = `*\n${prefixLinesWith(
            commentContent,
            CONTENT_PREFIX,
          )}\n `;
        }
      } else {
        comment.value = "";
      }
    });

    ast.comments = ast.comments.filter(
      (comment) => !isBlockComment(comment) || comment.value,
    );

    return ast;
  };

function isBlockComment(comment: PrettierComment): boolean {
  return comment.type === "CommentBlock" || comment.type === "Block";
}

function getIndentationWidth(
  comment: PrettierComment,
  options: JsdocOptions,
): number {
  let width = comment.loc.start.column;
  if (options.useTabs) {
    width *= options.tabWidth;
  }
  return width;
}

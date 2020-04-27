const commentParser = require("comment-parser");
const prettier = require("prettier");
const { convertToModernArray, formatType } = require("./type");
const {
  YIELDS,
  RETURNS,
  THROWS,
  EXAMPLE,
  DESCRIPTION,
  ABSTRACT,
  EXTENDS,
  CLASS,
  CONSTANT,
  DEFAULT,
  EXTERNAL,
  FILE,
  FIRES,
  FUNCTION,
  MEMBER,
  PARAM,
  PROPERTY,
  TYPE,
  TYPEDEF,
  TODO,
  SINCE,
  CATEGORY,
  MEMBEROF,
  SEE,
} = require("./tags");

const tagSynonyms = {
  // One TAG TYPE can have different titles called SYNONYMS.  We want
  // to avoid different titles in the same tag so here is map with
  // synonyms as keys and tag type as value that we want to have in
  // final jsDoc.
  virtual: ABSTRACT,
  constructor: CLASS,
  const: CONSTANT,
  defaultvalue: DEFAULT,
  desc: DESCRIPTION,
  host: EXTERNAL,
  fileoverview: FILE,
  overview: FILE,
  emits: FIRES,
  func: FUNCTION,
  method: FUNCTION,
  var: MEMBER,
  arg: PARAM,
  argument: PARAM,
  prop: PROPERTY,
  return: RETURNS,
  exception: THROWS,
  yield: YIELDS,
  examples: EXAMPLE,
  params: PARAM,
};

const namelessTags = [
  YIELDS,
  RETURNS,
  THROWS,
  EXAMPLE,
  EXTENDS,
  DESCRIPTION,
  TODO,
];
const descriptionNeededTags = [DESCRIPTION, EXAMPLE, TODO, SINCE, CATEGORY];
const typeNeededTags = [
  EXTENDS,
  RETURNS,
  YIELDS,
  THROWS,
  PARAM,
  PROPERTY,
  TYPE,
  TYPEDEF,
];

const verticallyAlignAbleTags = [
  PARAM,
  PROPERTY,
  RETURNS,
  EXTENDS,
  THROWS,
  YIELDS,
  TYPE,
  TYPEDEF,
];

/**
 * Trim, make single line with capitalized text. Insert dot if flag for it is
 * set to true and last character is a word character
 *
 * @private
 * @param {String} text TODO
 * @param {Boolean} insertDot Flag for dot at the end of text
 * @returns {String} TODO
 */
function formatDescription(text, insertDot) {
  text = text || "";
  text = text.replace(/^[\W]/g, "");
  text = text.trim();

  if (!text) return text;

  text = text = text.replace(/\s\s+/g, " "); // Avoid multiple spaces
  text = text.replace(/\n/g, " "); // Make single line
  if (insertDot) text = text.replace(/(\w)(?=$)/g, "$1."); // Insert dot if needed
  text = text[0].toUpperCase() + text.slice(1); // Capitalize
  return text || "";
}

function convertCommentDescToDescTag(parsed) {
  if (!parsed.description) {
    return;
  }

  const Tag = parsed.tags.find(({ tag }) => tag.toLowerCase() === DESCRIPTION);
  let { tag: description = "" } = Tag || {};

  description += parsed.description;

  if (Tag) {
    Tag.description = description;
  } else {
    parsed.tags.push({ tag: DESCRIPTION, description });
  }
}

function descriptionEndLine({ description, tag, isEndTag }) {
  if (description.length < 0 || isEndTag) {
    return "";
  }

  if ([DESCRIPTION, EXAMPLE, TODO].includes(tag)) {
    return "\n *";
  }

  const isDescriptionMultiLine = description.includes("\n");

  return isDescriptionMultiLine ? "\n *" : "";
}

/**
 * @link https://prettier.io/docs/en/api.html#custom-parser-api}
 */
exports.jsdocParser = function jsdocParser(text, parsers, options) {
  const ast = parsers["babel-flow"](text);
  // Options
  const gap = " ".repeat(options.jsdocSpaces);
  const { printWidth } = options;

  /**
   * Control order of tags by weights. Smaller value brings tag higher.
   *
   * @param {String} tagTitle TODO
   * @returns {Number} Tag weight
   */
  function getTagOrderWeight(tagTitle) {
    if (tagTitle === DESCRIPTION && !options.jsdocDescriptionTag) {
      return -1;
    }
    const index = options.jsdocTagsOrder.indexOf(tagTitle);
    return index === -1
      ? options.jsdocTagsOrder.indexOf("other") || options.jsdocTagsOrder.length
      : index;
  }

  ast.comments.forEach((comment) => {
    // Parse only comment blocks
    if (comment.type !== "CommentBlock") return;

    const commentString = `/*${comment.value}*/`;

    // Check if this comment block is a JSDoc.  Based on:
    // https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
    if (!commentString.match(/\/\*\*[\s\S]+?\*\//g)) return;

    const parsed = commentParser(commentString, { dotted_names: false })[0];

    comment.value = "*\n";

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
          tag = tag && tag.trim().toLowerCase();
          tag = tagSynonyms[tag] || tag;
          const isVerticallyAlignAbleTags = verticallyAlignAbleTags.includes(
            tag
          );

          if (namelessTags.includes(tag) && name) {
            description = `${name} ${description}`;
            name = "";
          }

          if (!type && typeNeededTags.includes(tag)) {
            type = "any";
          }

          if (isVerticallyAlignAbleTags) {
            maxTagTitleLength = Math.max(maxTagTitleLength, tag.length);
          }

          if (type) {
            type = convertToModernArray(type);
            type = formatType(type, options);

            if (isVerticallyAlignAbleTags)
              maxTagTypeNameLength = Math.max(
                maxTagTypeNameLength,
                type.length
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

          if (
            [
              DESCRIPTION,
              PARAM,
              PROPERTY,
              RETURNS,
              YIELDS,
              THROWS,
              TODO,
              TYPE,
              TYPEDEF,
            ].includes(tag)
          ) {
            description = formatDescription(
              description,
              options.jsdocDescriptionWithDot
            );
          }
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
        }
      )

      // Sort tags
      .sort((a, b) => getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag))

      // Create final jsDoc string
      .forEach(({ name, description, type, tag }, tagIndex) => {
        if (!description && descriptionNeededTags.includes(tag)) {
          return;
        }

        let tagTitleGapAdj = 0;
        let tagTypeGapAdj = 0;
        let tagNameGapAdj = 0;
        let descGapAdj = 0;

        if (
          options.jsdocVerticalAlignment &&
          verticallyAlignAbleTags.includes(tag)
        ) {
          if (tag) tagTitleGapAdj += maxTagTitleLength - tag.length;
          else if (maxTagTitleLength)
            descGapAdj += maxTagTitleLength + gap.length;

          if (type) tagTypeGapAdj += maxTagTypeNameLength - type.length;
          else if (maxTagTypeNameLength)
            descGapAdj += maxTagTypeNameLength + gap.length;

          if (name) tagNameGapAdj += maxTagNameLength - name.length;
          else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length;
        }

        let useTagTitle = tag !== DESCRIPTION || options.jsdocDescriptionTag;
        let tagString = ` * `;

        if (useTagTitle) {
          try {
            tagString += `@${tag}${" ".repeat(tagTitleGapAdj)}`;
          } catch (error) {
            const isVerticallyAlignAbleTags = verticallyAlignAbleTags.includes(
              tag
            );
            console.log({
              maxTagTitleLength,
              tag: tag.length,
              isVerticallyAlignAbleTags,
            });
            console.log(error);
          }
        }
        if (type) tagString += gap + `{${type}}` + " ".repeat(tagTypeGapAdj);
        if (name) tagString += `${gap}${name}${" ".repeat(tagNameGapAdj)}`;

        // Add description (complicated because of text wrap)
        if (description && tag !== EXAMPLE) {
          if (useTagTitle) tagString += gap + " ".repeat(descGapAdj);
          if ([MEMBEROF, SEE].includes(tag)) {
            // Avoid wrapping
            tagString += description;
          } else {
            // Wrap tag description
            const marginLength = tagString.length;
            let maxWidth = printWidth;

            if (marginLength >= maxWidth) {
              maxWidth = marginLength + 20;
            }
            description = `${tagString}${description}`;
            tagString = "";
            while (description.length > maxWidth) {
              let sliceIndex = description.lastIndexOf(" ", maxWidth);
              if (sliceIndex === -1 || sliceIndex <= marginLength + 2)
                sliceIndex = maxWidth;
              tagString += description.substring(0, sliceIndex);
              description = description.substring(sliceIndex + 1);
              description = `\n * ${description}`;
            }

            tagString += description;
          }
        }

        // Try to use prettier on @example tag description
        if (tag === EXAMPLE) {
          try {
            const formattedDescription = prettier.format(
              description || "",
              options
            );
            tagString += formattedDescription.replace(/(^|\n)/g, "\n *   ");
            tagString = tagString.slice(0, tagString.length - 6);
          } catch (err) {
            tagString += "\n";
            tagString += description
              .split("\n")
              .map(
                (l) =>
                  ` *   ${
                    options.jsdocKeepUnParseAbleExampleIndent ? l : l.trim()
                  }`
              )
              .join("\n");
          }
        }

        // Add empty line after some tags if there is something below
        tagString += descriptionEndLine({
          description,
          tag,
          isEndTag: tagIndex === parsed.tags.length - 1,
        });

        tagString += "\n";

        comment.value += tagString;
      });

    comment.value += " ";
  });

  return ast;
};

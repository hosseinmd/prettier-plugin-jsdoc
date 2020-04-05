const commentParser = require('comment-parser')
const prettier = require('prettier')
const { convertToModernArray, formatType } = require('./type')
const {
  TAG_YIELDS,
  TAG_RETURNS,
  TAG_THROWS,
  TAG_EXAMPLE,
  TAG_ASYNC,
  TAG_PRIVATE,
  TAG_DEPRECATED,
  TAG_DESCRIPTION,
} = require('./tags')

const tagSynonyms = {
  // One TAG TYPE can have different titles called SYNONYMS.  We want
  // to avoid different titles in the same tag so here is map with
  // synonyms as keys and tag type as value that we want to have in
  // final jsDoc.
  virtual: 'abstract',
  extends: 'augments',
  constructor: 'class',
  const: 'constant',
  defaultvalue: 'default',
  desc: TAG_DESCRIPTION,
  host: 'external',
  fileoverview: 'file',
  overview: 'file',
  emits: 'fires',
  func: 'function',
  method: 'function',
  var: 'member',
  arg: 'param',
  argument: 'param',
  prop: 'property',
  return: TAG_RETURNS,
  exception: TAG_THROWS,
  yield: TAG_YIELDS,
  examples: TAG_EXAMPLE,
  params: 'param',
}

const namelessTags = [TAG_YIELDS, TAG_RETURNS, TAG_THROWS, TAG_EXAMPLE, TAG_DESCRIPTION]
const statusTags = [TAG_ASYNC, TAG_DEPRECATED, TAG_PRIVATE]

const verticallyAlignAbleTags = ['param', 'property', TAG_RETURNS, TAG_THROWS, TAG_YIELDS, 'type', 'typedef']

/**
 * Trim, make single line with capitalized text. Insert dot if flag for it is
 * set to true and last character is a word character
 * @private
 * @param  {String}  text      TODO
 * @param  {Boolean} insertDot Flag for dot at the end of text
 * @return {String}            TODO
 */
function formatDescription(text, insertDot) {
  text = text || ''
  text = text.replace(/^[\W]/g, '')
  text = text.trim()

  if (!text) return text

  text = text = text.replace(/\s\s+/g, ' ') // Avoid multiple spaces
  text = text.replace(/\n/g, ' ') // Make single line
  if (insertDot) text = text.replace(/(\w)(?=$)/g, '$1.') // Insert dot if needed
  text = text[0].toUpperCase() + text.slice(1) // Capitalize
  return text || ''
}

/**
 * {@link https://prettier.io/docs/en/api.html#custom-parser-api}
 */
exports.jsdocParser = function jsdocParser(text, parsers, options) {
  const ast = parsers['babel-flow'](text)
  // Options
  const gap = ' '.repeat(options.jsdocSpaces)
  const { printWidth } = options

  /**
   * Control order of tags by weights. Smaller value brings tag higher.
   *
   * @param  {String} tagTitle TODO
   * @return {Number}          Tag weight
   */
  function getTagOrderWeight(tagTitle) {
    const index = options.jsdocTagsOrder.indexOf(tagTitle)
    return index === -1 ? options.jsdocTagsOrder.indexOf('other') || 0 : index
  }

  ast.comments.forEach(comment => {
    // Parse only comment blocks
    if (comment.type !== 'CommentBlock') return

    const commentString = `/*${comment.value}*/`

    // Check if this comment block is a JSDoc.  Based on:
    // https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
    if (!commentString.match(/\/\*\*[\s\S]+?\*\//g)) return

    const parsed = commentParser(commentString, { dotted_names: true })[0]

    comment.value = '*\n'

    if (parsed.description && !parsed.tags.find(t => t.tag.toLowerCase() === TAG_DESCRIPTION))
      parsed.tags.push({ tag: TAG_DESCRIPTION, description: parsed.description })

    let maxTagTitleLength = 0
    let maxTagTypeNameLength = 0
    let maxTagNameLength = 0

    parsed.tags

      // Prepare tags data
      .map(({ name, description, type, tag, source, optional, default: _default, ...restInfo }) => {
        const isVerticallyAlignAbleTags = verticallyAlignAbleTags.includes(tag)
        if (type) {
          type = convertToModernArray(type)
          type = formatType(type, options)
        }

        tag = tag && tag.trim().toLowerCase()
        tag = tagSynonyms[tag] || tag

        if (namelessTags.includes(tag) && name) {
          description = `${name} ${description}`
          name = ''
        }

        if (isVerticallyAlignAbleTags) {
          maxTagTitleLength = Math.max(maxTagTitleLength, tag.length)
        }

        if (type) {
          // Figure out tag.type

          if (isVerticallyAlignAbleTags) maxTagTypeNameLength = Math.max(maxTagTypeNameLength, type.length)

          // Additional operations on name
          if (name) {
            // Optional tag name
            if (optional) {
              // Figure out if tag type have default value
              if (_default) {
                name = `${name} = ${_default}`
              }
              name = `[${name}]`
            }

            if (isVerticallyAlignAbleTags) maxTagNameLength = Math.max(maxTagNameLength, name.length)
          }
        }

        if (
          [
            TAG_DESCRIPTION,
            'param',
            'property',
            TAG_RETURNS,
            TAG_YIELDS,
            TAG_THROWS,
            'todo',
            'type',
            'typedef',
          ].includes(tag)
        ) {
          description = formatDescription(description, options.jsdocDescriptionWithDot)
        }
        return { ...restInfo, name, description, type, tag, source, default: _default, optional }
      })

      // Sort tags
      .sort((a, b) => getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag))

      // Create final jsDoc string
      .forEach(({ name, description, type, tag }, tagIndex) => {
        if (!name && !description && !type && !statusTags.includes(tag)) {
          return
        }

        let tagTitleGapAdj = 0
        let tagTypeGapAdj = 0
        let tagNameGapAdj = 0
        let descGapAdj = 0

        if (options.jsdocVerticalAlignment && verticallyAlignAbleTags.includes(tag)) {
          if (tag) tagTitleGapAdj += maxTagTitleLength - tag.length
          else if (maxTagTitleLength) descGapAdj += maxTagTitleLength + gap.length

          if (type) tagTypeGapAdj += maxTagTypeNameLength - type.length
          else if (maxTagTypeNameLength) descGapAdj += maxTagTypeNameLength + gap.length

          if (name) tagNameGapAdj += maxTagNameLength - name.length
          else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length
        }

        let useTagTitle = tag !== TAG_DESCRIPTION || options.jsdocDescriptionTag
        let tagString = ` * `

        if (useTagTitle) tagString += `@${tag}` + ' '.repeat(tagTitleGapAdj)
        if (type) tagString += gap + `{${type}}` + ' '.repeat(tagTypeGapAdj)
        if (name) tagString += `${gap}${name}${' '.repeat(tagNameGapAdj)}`

        // Add description (complicated because of text wrap)
        if (description && tag !== TAG_EXAMPLE) {
          if (useTagTitle) tagString += gap + ' '.repeat(descGapAdj)
          if (['memberof', 'see'].includes(tag)) {
            // Avoid wrapping
            tagString += description
          } else {
            // Wrap tag description
            const marginLength = tagString.length
            let maxWidth = printWidth
            let isMultiLine = false

            if (marginLength >= maxWidth) {
              maxWidth = marginLength + 20
            }
            description = `${tagString}${description}`
            tagString = ''
            while (description.length > maxWidth) {
              let sliceIndex = description.lastIndexOf(' ', maxWidth)
              if (sliceIndex === -1 || sliceIndex <= marginLength + 2) sliceIndex = maxWidth
              tagString += description.substring(0, sliceIndex)
              description = description.substring(sliceIndex + 1)
              description = `\n * ${description}`
              isMultiLine = true
            }

            if (description.length > 0) tagString = `${tagString}${description}${isMultiLine ? '\n *' : ''}`
          }
        }

        // Try to use prettier on @example tag description
        if (tag === TAG_EXAMPLE) {
          try {
            const formatedDescription = prettier.format(description || '', options)
            tagString += formatedDescription.replace(/(^|\n)/g, '\n *   ')
            tagString = tagString.slice(0, tagString.length - 6)
          } catch (err) {
            tagString += '\n'
            tagString += description
              .split('\n')
              .map(l => ` *   ${options.jsdocKeepUnparseableExampleIndent ? l : l.trim()}`)
              .join('\n')
          }
        }

        tagString += '\n'

        // Add empty line after some tags if there is something below
        if ([TAG_DESCRIPTION, TAG_EXAMPLE, 'todo'].includes(tag) && tagIndex !== parsed.tags.length - 1)
          tagString += ' *\n'

        comment.value += tagString
      })

    comment.value += ' '
  })

  return ast
}

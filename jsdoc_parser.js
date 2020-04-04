const commentParser = require('comment-parser')
const prettier = require('prettier')
const { convertToModernArray } = require('./type')

const babelFlow = require('prettier/parser-babylon').parsers['babel-flow']

const TAG_YIELDS = 'yields'
const TAG_RETURNS = 'returns'
const TAG_THROWS = 'throws'
const TAG_EXAMPLE = 'example'
const TAG_ASYNC = 'async'
const TAG_PRIVATE = 'private'
const TAG_DEPRECATED = 'deprecated'
const TAG_DESCRIPTION = 'description'

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

const vertiacallyAlignableTags = ['param', 'property', TAG_RETURNS, TAG_THROWS, TAG_YIELDS, 'type', 'typedef']

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
function jsdocParser(text, parsers, options) {
  const ast = parsers['babel-flow'](text)
  // Options
  const gap = ' '.repeat(options.jsdocSpaces)
  const printWidth = options.jsdocPrintWidth

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
      .map(({ name, description, type, ...tag }) => {
        if (type) {
          type = convertToModernArray(type)
        }

        tag.tag = tag.tag && tag.tag.trim().toLowerCase()
        tag.tag = tagSynonyms[tag.tag] || tag.tag

        if (namelessTags.includes(tag.tag) && name) {
          description = `${name} ${description}`
          name = ''
        }

        if (vertiacallyAlignableTags.includes(tag.tag)) {
          maxTagTitleLength = Math.max(maxTagTitleLength, tag.tag.length)
        }

        if (type) {
          // Figure out tag.type

          if (vertiacallyAlignableTags.includes(tag.tag))
            maxTagTypeNameLength = Math.max(maxTagTypeNameLength, type.length)

          // Additional operations on name
          if (name) {
            // Figure out if tag type have default value
            const part = tag.source.split(new RegExp(`@.+{.+}.+${name}\s?=\s?`))[1]
            if (part) name = name + '=' + part.split(/\s/)[0].replace(']', '')

            // Optional tag name
            if (tag.optional) name = `[${name}]`
            if (vertiacallyAlignableTags.includes(tag.tag)) maxTagNameLength = Math.max(maxTagNameLength, name.length)
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
          ].includes(tag.tag)
        ) {
          description = formatDescription(description, options.jsdocDescriptionWithDot)
        }
        return { ...tag, name, description, type }
      })

      // Sort tags
      .sort((a, b) => getTagOrderWeight(a.tag) - getTagOrderWeight(b.tag))

      // Create final jsDoc string
      .forEach((tag, tagIndex) => {
        const { name, description, type } = tag

        if (!name && !description && !type && !statusTags.includes(tag.tag)) {
          return
        }

        let tagTitleGapAdj = 0
        let tagTypeGapAdj = 0
        let tagNameGapAdj = 0
        let descGapAdj = 0

        if (options.jsdocVerticalAlignment && vertiacallyAlignableTags.includes(tag.tag)) {
          if (tag.tag) tagTitleGapAdj += maxTagTitleLength - tag.tag.length
          else if (maxTagTitleLength) descGapAdj += maxTagTitleLength + gap.length

          if (tag.type) tagTypeGapAdj += maxTagTypeNameLength - tag.type.length
          else if (maxTagTypeNameLength) descGapAdj += maxTagTypeNameLength + gap.length

          if (tag.name) tagNameGapAdj += maxTagNameLength - tag.name.length
          else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length
        }

        let useTagTitle = tag.tag !== TAG_DESCRIPTION || options.jsdocDescriptionTag
        let tagString = ` * `

        if (useTagTitle) tagString += `@${tag.tag}` + ' '.repeat(tagTitleGapAdj)
        if (tag.type) tagString += gap + `{${tag.type}}` + ' '.repeat(tagTypeGapAdj)
        if (tag.name) tagString += `${gap}${tag.name}${' '.repeat(tagNameGapAdj)}`

        // Add description (complicated because of text wrap)
        if (tag.description && tag.tag !== TAG_EXAMPLE) {
          if (useTagTitle) tagString += gap + ' '.repeat(descGapAdj)
          if (['memberof', 'see'].includes(tag.tag)) {
            // Avoid wrapping
            tagString += tag.description
          } else {
            // Wrap tag description
            const marginLength = tagString.length
            let maxWidth = printWidth
            let isMultiLine = false

            if (marginLength >= maxWidth) maxWidth = marginLength + 40
            let description = `${tagString}${tag.description}`
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
        if (tag.tag === TAG_EXAMPLE) {
          try {
            const formatedDescription = prettier.format(tag.description || '', options)
            tagString += formatedDescription.replace(/(^|\n)/g, '\n *   ')
            tagString = tagString.slice(0, tagString.length - 6)
          } catch (err) {
            tagString += '\n'
            tagString += tag.description
              .split('\n')
              .map(l => ` *   ${options.jsdocKeepUnparseableExampleIndent ? l : l.trim()}`)
              .join('\n')
          }
        }

        tagString += '\n'

        // Add empty line after some tags if there is something below
        if ([TAG_DESCRIPTION, TAG_EXAMPLE, 'todo'].includes(tag.tag) && tagIndex !== parsed.tags.length - 1)
          tagString += ' *\n'

        comment.value += tagString
      })

    comment.value += ' '
  })

  return ast
}

// jsdoc-parser
module.exports = {
  languages: [
    {
      name: 'JavaScript',
      parsers: ['jsdoc-parser'],
    },
  ],
  parsers: {
    'jsdoc-parser': Object.assign({}, babelFlow, { parse: jsdocParser }),
  },
  // How to define options: https://github.com/prettier/prettier/blob/master/src/cli/constant.js#L16
  // Issue with string type: https://github.com/prettier/prettier/issues/6151
  options: {
    jsdocSpaces: {
      type: 'int',
      category: 'jsdoc',
      default: 1,
      description: 'How many spaces will be used to separate tag elements.',
    },
    jsdocPrintWidth: {
      type: 'int',
      category: 'jsdoc',
      default: 80,
      description: 'After how many characters description text should be wrapped.',
    },
    jsdocTagsOrder: {
      type: 'path',
      category: 'jsdoc',
      array: true, // Fancy way to get option in array form
      default: [
        {
          value: [
            'typedef',
            TAG_DEPRECATED,
            TAG_ASYNC,
            TAG_PRIVATE,
            'global',
            'class',
            'type',
            'memberof',
            'namespace',
            'callback',
            TAG_DESCRIPTION,
            'see',
            'todo',
            'examples',
            'other',
            'param',
            TAG_THROWS,
            TAG_YIELDS,
            TAG_RETURNS,
          ],
        },
      ],
      description: 'Define order of tags.',
    },
    jsdocDescriptionWithDot: {
      type: 'boolean',
      category: 'jsdoc',
      default: false,
      description: 'Should dot be inserted at the end of description',
    },
    jsdocDescriptionTag: {
      type: 'boolean',
      category: 'jsdoc',
      default: true,
      description: 'Should description tag be used',
    },
    jsdocVerticalAlignment: {
      type: 'boolean',
      category: 'jsdoc',
      default: false,
      description: 'Should tags, types, names and description be aligned',
    },
    jsdocUnionTypeParentheses: {
      type: 'boolean',
      category: 'jsdoc',
      default: false,
      description: 'Should union type be enclosed in parentheses',
    },
    jsdocKeepUnparseableExampleIndent: {
      type: 'boolean',
      category: 'jsdoc',
      default: false,
      description: 'Should unParseAble example (pseudo code or no js code) keep its indentation',
    },
  },
  defaultOptions: {
    jsdocSpaces: 1,
    jsdocPrintWidth: 80,
    jsdocDescriptionWithDot: false,
    jsdocDescriptionTag: true,
    jsdocVerticalAlignment: false,
    jsdocUnionTypeParentheses: false,
    jsdocKeepUnparseableExampleIndent: false,
  },
}

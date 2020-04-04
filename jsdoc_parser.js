const doctrine = require('doctrine')
const prettier = require('prettier')
const babelFlow = require('prettier/parser-babylon').parsers['babel-flow']

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
  desc: 'description',
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
  returns: 'return',
  exception: 'throws',
  yield: 'yields',

  // {@link} (synonyms: {@linkcode}, {@linkplain})
  // TODO I'm not sure how @link is parsed.  I will have to look up
  //      that later.  It's not important for my because in our
  //      projects we don't use @link.  Or maybe we are?

  // It looks like sometimes someone use incorrect tag title.  Its
  // close to correct title but not quite.  We want to map that too.
  examples: 'example',
  params: 'param',
}

const vertiacallyAlignableTags = ['param', 'property', 'return', 'throws', 'yields']

const typePrefixMap = {
  NullableType: '?',
  NonNullableType: '!',
}

/**
 * Return properly formatted tag type name. Call itself recursively for complex
 * inner types
 *
 * @param  {Object}  tagType              Tag type object from parsed jsdoc
 * @param  {Boolean} unionTypeParentheses Flag for parentheses around union type
 * @return {String}                       Formatted tag type
 */
function getTagTypeName(tagType, unionTypeParentheses) {
  let { name } = tagType

  if (name) return name

  let { type, expression, applications, elements, prefix } = tagType

  switch (type) {
    case 'UndefinedLiteral':
      return 'undefined'
    case 'NullLiteral':
      return 'null'
    case 'AllLiteral':
      return '*'
    case 'RestType':
      return `...${getTagTypeName(expression)}`
    case 'NullableType':
    case 'NonNullableType':
      return `${prefix ? typePrefixMap[type] : ''}${getTagTypeName(expression)}`
    case 'TypeApplication':
      return `${getTagTypeName(expression)}.<${applications.map(a => getTagTypeName(a)).join(', ')}>`
    case 'OptionalType':
      return getTagTypeName(expression)
    case 'UnionType':
      return `${unionTypeParentheses ? '(' : ''}${elements.map(e => getTagTypeName(e)).join('|')}${
        unionTypeParentheses ? ')' : ''
      }`
    default:
      return ''
  }
}

/**
 * Trim, make single line with capitalized text. Insert dot if flag for it is
 * set to true and last character is a word character
 *
 * @param  {String}  text      TODO
 * @param  {Boolean} insertDot Flag for dot at the end of text
 * @return {String}            TODO
 */
function formatDescription(text, insertDot) {
  text = text ? text.trim() : ''
  if (!text) return ''
  text = text.replace(/\s\s+/g, ' ') // Avoid multiple spaces
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

    const parsed = doctrine.parse(commentString, { unwrap: true, sloppy: true })

    comment.value = '*\n'

    if (parsed.description && !parsed.tags.find(t => t.title.toLowerCase() === 'description'))
      parsed.tags.push({ title: 'description', description: parsed.description })

    let maxTagTitleLength = 0
    let maxTagTypeNameLength = 0
    let maxTagNameLength = 0

    parsed.tags

      // Prepare tags data
      .map(tag => {
        tag.title = tag.title.trim().toLowerCase()
        tag.title = tagSynonyms[tag.title] || tag.title

        if (vertiacallyAlignableTags.includes(tag.title))
          maxTagTitleLength = Math.max(maxTagTitleLength, tag.title.length)

        if (tag.type) {
          // Figure out tag.type.name
          tag.type.name = getTagTypeName(tag.type, options.jsdocUnionTypeParentheses)

          if (vertiacallyAlignableTags.includes(tag.title))
            maxTagTypeNameLength = Math.max(maxTagTypeNameLength, tag.type.name.length)

          // Additional operations on tag.name
          if (tag.name) {
            // Figure out if tag type have default value
            const part = commentString.split(new RegExp(`@.+{.+}.+${tag.name}\s?=\s?`))[1]
            if (part) tag.name = tag.name + '=' + part.split(/\s/)[0].replace(']', '')

            // Optional tag name
            if (tag.type.type === 'OptionalType') tag.name = `[${tag.name}]`
            if (vertiacallyAlignableTags.includes(tag.title))
              maxTagNameLength = Math.max(maxTagNameLength, tag.name.length)
          }
        }

        if (['description', 'param', 'property', 'return', 'yields', 'throws', 'todo'].includes(tag.title))
          tag.description = formatDescription(tag.description, options.jsdocDescriptionWithDot)

        if (
          !tag.description &&
          ['description', 'param', 'property', 'return', 'yields', 'throws', 'todo', 'memberof'].includes(tag.title) &&
          (!tag.type || !['Undefined', 'undefined', 'Null', 'null', 'Void', 'void'].includes(tag.type.name))
        )
          tag.description = formatDescription('TODO', options.jsdocDescriptionWithDot)

        return tag
      })

      // Sort tags
      .sort((a, b) => getTagOrderWeight(a.title) - getTagOrderWeight(b.title))

      // Create final jsDoc string
      .forEach((tag, tagIndex) => {
        let tagTitleGapAdj = 0
        let tagTypeGapAdj = 0
        let tagNameGapAdj = 0
        let descGapAdj = 0

        if (options.jsdocVerticalAlignment && vertiacallyAlignableTags.includes(tag.title)) {
          if (tag.title) tagTitleGapAdj += maxTagTitleLength - tag.title.length
          else if (maxTagTitleLength) descGapAdj += maxTagTitleLength + gap.length

          if (tag.type && tag.type.name) tagTypeGapAdj += maxTagTypeNameLength - tag.type.name.length
          else if (maxTagTypeNameLength) descGapAdj += maxTagTypeNameLength + gap.length

          if (tag.name) tagNameGapAdj += maxTagNameLength - tag.name.length
          else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length
        }

        let useTagTitle = tag.title !== 'description' || options.jsdocDescriptionTag
        let tagString = ` * `

        if (useTagTitle) tagString += `@${tag.title}` + ' '.repeat(tagTitleGapAdj)
        if (tag.type && tag.type.name) tagString += gap + `{${tag.type.name}}` + ' '.repeat(tagTypeGapAdj)
        if (tag.name) tagString += gap + tag.name + ' '.repeat(tagNameGapAdj)

        // Add description (complicated because of text wrap)
        if (tag.description && tag.title !== 'example') {
          if (useTagTitle) tagString += gap + ' '.repeat(descGapAdj)
          if (['memberof', 'see'].includes(tag.title)) {
            // Avoid wrapping
            tagString += tag.description
          } else {
            // Wrap tag description
            const marginLength = tagString.length
            let maxWidth = printWidth
            if (marginLength >= maxWidth) maxWidth = marginLength + 40
            let description = tagString + tag.description
            tagString = ''

            while (description.length > maxWidth) {
              let sliceIndex = description.lastIndexOf(' ', maxWidth)
              if (sliceIndex === -1 || sliceIndex <= marginLength + 2) sliceIndex = maxWidth
              tagString += description.slice(0, sliceIndex)
              description = description.slice(sliceIndex + 1, description.length)
              description = '\n *' + ' '.repeat(marginLength - 2) + description
            }

            if (description.length > marginLength) tagString += description
          }
        }

        // Try to use prettier on @example tag description
        if (tag.title === 'example') {
          try {
            const formatedDescription = prettier.format(tag.description, options)
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
        if (['description', 'example', 'todo'].includes(tag.title) && tagIndex !== parsed.tags.length - 1)
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
            'async',
            'private',
            'global',
            'class',
            'memberof',
            'namespace',
            'callback',
            'description',
            'see',
            'todo',
            'examples',
            'other',
            'param',
            'throws',
            'yields',
            'return',
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
      description: 'Should unparseable esample (pseudo code or no js code) keep its indentation',
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

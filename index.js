const {
  TAG_YIELDS,
  TAG_RETURNS,
  TAG_THROWS,
  TAG_EXAMPLE,
  TAG_ASYNC,
  TAG_PRIVATE,
  TAG_DEPRECATED,
  TAG_DESCRIPTION,
} = require('./src/tags')
const { jsdocParser } = require('./src')
const babelFlow = require('prettier/parser-babylon').parsers['babel-flow']

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
            TAG_EXAMPLE,
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
    jsdocKeepUnparseableExampleIndent: {
      type: 'boolean',
      category: 'jsdoc',
      default: false,
      description: 'Should unParseAble example (pseudo code or no js code) keep its indentation',
    },
  },
  defaultOptions: {
    jsdocSpaces: 1,
    jsdocDescriptionWithDot: false,
    jsdocDescriptionTag: true,
    jsdocVerticalAlignment: false,
    jsdocKeepUnparseableExampleIndent: false,
  },
}

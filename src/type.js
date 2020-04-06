const prettier = require('prettier')

exports.convertToModernArray = function convertToModernArray(type) {
  if (!type) {
    return type
  }

  const maxWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^<>]+)>)/g
  const minWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^.]+)>)/g
  type = type.replace('.<', '<')

  function replaceArray(value) {
    let regular = maxWrapper
    let result = regular.exec(value)

    if (!result) {
      regular = minWrapper
      result = regular.exec(value)
    }

    if (!result) {
      return value
    }
    const typeName = result[2]

    value = value.replace(regular, `${typeName}[]`)
    return replaceArray(value)
  }

  return replaceArray(type)
}

exports.formatType = function formatType(type, options) {
  try {
    let pretty = type.replace('*', 'any')
    const TYPE_START = 'type name = '

    pretty = prettier.format(`${TYPE_START}${pretty}`, { ...options, parser: 'typescript' })
    pretty = pretty.slice(TYPE_START.length)

    pretty = pretty.replace(/[(;\n);\n]*$/g, '')

    return pretty
  } catch (error) {
    return type
  }
}

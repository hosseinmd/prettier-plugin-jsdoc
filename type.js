exports.convertToModernArray = function convertToModernArray(type) {
  if (!type) {
    return type
  }

  const maxWrapper = /(Array<([^<>]+)>)/g
  const minWrapper = /(Array<([^.]+)>)/g
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

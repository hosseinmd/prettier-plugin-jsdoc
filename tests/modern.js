/* eslint-disable no-undef */
const prettier = require('prettier')

function subject(code, options = {}) {
  return prettier.format(code, {
    parser: 'jsdoc-parser',
    plugins: ['.'],
    jsdocSpaces: 1,
    ...options,
  })
}

test('convert array to modern type', () => {
  const result = subject(`
  /**
   * @typedef {import("react-native-reanimated").default.Adaptable<number>} Adaptable
   * @param {Adaptable} animNode
   * @param {object} InterpolationConfig
   * @param {ReadonlyArray<Adaptable>} InterpolationConfig.inputRange Like [0,1]
   * @param {Array<string>} InterpolationConfig.outputRange Like ["#0000ff","#ff0000"]
   * @param {import("react-native-reanimated").default.Extrapolate} [InterpolationConfig.extrapolate]
   *
   */
  function a(){}
`)

  expect(result).toMatchSnapshot()
})

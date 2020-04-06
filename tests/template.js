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

test('template for callback', () => {
  const result = subject(`
/**
 * @template T
 * @callback CallbackName
 * @param {GetStyles<T>} getStyles
 * @returns {UseStyle<T>}
 */
`)

  expect(result).toMatchSnapshot()
})

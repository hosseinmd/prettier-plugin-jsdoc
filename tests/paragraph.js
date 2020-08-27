/* eslint-disable no-undef */
const prettier = require("prettier");

function subject(code, options = {}) {
  try {
    return prettier.format(code, {
      parser: "jsdoc-parser",
      plugins: ["."],
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
}

test("description contain paragraph", () => {
  const result = subject(`
/**
 * Does the following things:
 * 
 *    1. Thing 1
 * 
 *    2. Thing 2
 * 
 *    3. Thing 3
 */
    `);

  expect(result).toMatchSnapshot();

  const result2 = subject(`
class test {
  /**
   * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
   *  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
   * 
   *  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
   * 
   * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
   * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
   */
  a(){}
}
`);
  expect(result2).toMatchSnapshot();
});

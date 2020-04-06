/* eslint-disable no-undef */
const prettier = require("prettier");

function subject(code, options = {}) {
  return prettier.format(code, {
    parser: "jsdoc-parser",
    plugins: ["."],
    jsdocSpaces: 1,
    ...options,
  });
}

test("dotted names function param", () => {
  const result = subject(`
  /**
   * @param {object} data
   * @param {string} data.userName
   * @param {string} data.password
   *
   * @typedef {object} LoginResponse
   * @property {string} token
   * @property {number} expires
   * @property {boolean} mustChangePassword
   *
   * @returns {import('axios').AxiosResponse<LoginResponse>}
   */
    function a(){}
`);

  expect(result).toMatchSnapshot();
});

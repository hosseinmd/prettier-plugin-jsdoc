import prettier from "prettier";
import { JsdocOptions } from "../src/types";

function subject(code: string, options: Partial<JsdocOptions> = {}) {
  return prettier.format(code, {
    plugins: ["."],
    parser: "babel",
    jsdocSpaces: 1,
    ...options,
  } as JsdocOptions);
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

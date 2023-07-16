import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: ["prettier-plugin-jsdoc"],
    parser: "babel",
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("dotted names function param", async () => {
  const result = await subject(`
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

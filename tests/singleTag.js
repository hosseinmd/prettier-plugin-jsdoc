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

test("single tag", () => {
  const result = subject(`
  /**
  * @param {string} subDomainAddress
*/
  const SUB_DOMAIN = "SubDomain";

  export const SubDomain = {
    /**
     * @returns {import('axios').AxiosResponse<import('../types').SubDomain>}
     */
    async subDomain(subDomainAddress) {
    },
  };
  
`);

  expect(result).toMatchSnapshot();
});

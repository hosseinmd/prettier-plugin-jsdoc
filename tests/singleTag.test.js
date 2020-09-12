const prettier = require("prettier");

function subject(code, options = {}) {
  return prettier.format(code, {
    plugins: ["."],
    jsdocSpaces: 1,
    ...options,
  });
}

test("single tag", () => {
  const result = subject(`
  /**
* @param {  string   }    param0 description
   */
function fun(param0){}

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

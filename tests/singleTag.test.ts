import prettier from "prettier";
import { JsdocOptions } from "../src/types";

function subject(code: string, options: Partial<JsdocOptions> = {}) {
  return prettier.format(code, {
    plugins: ["."],
    jsdocSpaces: 1,
    parser: "babel",
    ...options,
  } as JsdocOptions);
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

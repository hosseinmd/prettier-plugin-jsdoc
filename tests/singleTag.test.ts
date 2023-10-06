import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: ["prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    parser: "babel",
    ...options,
  } as AllOptions);
}

test("single tag", async () => {
  const result = await subject(`
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

describe("Comment Line Strategy", () => {
  test("keep single", async () => {
    const result = await subject(
      `
  /** @type {import('eslint').Linter.Config} should be single line */
  const config = {
    // ...
  };
`,
      {
        jsdocCommentLineStrategy: "keep",
      },
    );
    expect(result).toMatchSnapshot();
  });

  test("keep multi", async () => {
    const result1 = await subject(
      `
  /** 
   * @type {import('eslint').Linter.Config} should be multiline
   */
  const config = {
    // ...
  };
`,
      {
        jsdocCommentLineStrategy: "keep",
      },
    );

    expect(result1).toMatchSnapshot();
  });
  test("singleLine ", async () => {
    const result2 = await subject(
      `
  /** 
   * @type {import('eslint').Linter.Config} should be single
   */
  const config = {
    // ...
  };
`,
      {
        jsdocCommentLineStrategy: "singleLine",
      },
    );
    expect(result2).toMatchSnapshot();
  });
  test("multiline ", async () => {
    const result3 = await subject(
      `
  /** @type {import('eslint').Linter.Config} should be multiline */
  const config = {
    // ...
  };
`,
      {
        jsdocCommentLineStrategy: "multiline",
      },
    );
    expect(result3).toMatchSnapshot();
  });
});

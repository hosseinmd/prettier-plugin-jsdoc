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

test("object property", () => {
  const result = subject(`
const obj = {
  /**
* @param {object} [filters]
   * @param {string} [filters.searchInput]
   * @param {boolean} [filters.isActive]
   * @param {boolean} [filters.isPerson]
   * @param {import('../types').IdentityStatus} [filters.identityStatuses]
   * @param {string} [filters.lastActivityFrom] YYYY-MM-DD
   * @param {string} [filters.lastActivityTo]
   * @param {string} [filters.registeredFrom]
   * @param {string} [filters.registeredTo]
   * @param {number} [filters.skip]
   * @param {number} [filters.take]
   * @param {string} [filters.orderBy]
   * @param {boolean} [filters.orderDesc]
   * @returns {import('axios').AxiosResponse<
    import('../types').ResellerUserIntroduced[]
  >}
  */
  a(filters) {},
};
`);

  expect(result).toMatchSnapshot();
});

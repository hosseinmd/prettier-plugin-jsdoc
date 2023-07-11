import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "babel-flow",
    plugins: ["prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("object property", async () => {
  const result = await subject(`

/**	
 * Copyright (c) 2015-present, Facebook, Inc.	
 * All rights reserved.	
 *   
 *    This source code is licensed under the license found in the LICENSE file in	
 * the root directory of this source tree.	
 */	

/**	
 * Copyright (c) 2015-present, Facebook, Inc.	
 * All rights reserved.	
 *   
 * This source code is licensed under the license found in the LICENSE file in	
 * the root directory of this source tree.	
 */	

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

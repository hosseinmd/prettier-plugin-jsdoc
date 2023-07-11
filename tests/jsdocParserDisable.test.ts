import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: [],
    parser: "babel",
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("template for callback", async () => {
  const result = await subject(`
/**
 * @template T
 *      @callback CallbackName
 *  @param {GetStyles<T>} getStyles
 * @returns       {UseStyle<T>}
 */
`);

  expect(result).toMatchSnapshot();
});

test("disabled complex object typedef ", async () => {
  const result = await subject(`
 /**
  * The bread crumbs indicate the navigate path and trigger the active page.
  * @class
  * @typedef {object} props
  * @prop        {any} navigation
  * @extends         {PureComponent<       props>} 
  */
 export class BreadCrumbs extends PureComponent {}
`);

  expect(result).toMatchSnapshot();

  const result2 = await subject(
    `
  /**
   * The bread crumbs indicate the navigate path and trigger the active page.
   * @class
   * @typedef {object} props
   * @prop        {any} navigation
   * @extends         {PureComponent<       props>} 
   */
  export class BreadCrumbs extends PureComponent {}
 `,
    {
      plugins: ["prettier-plugin-jsdoc"],
      jsdocParser: false,
    },
  );

  expect(result).toBe(result2);
});

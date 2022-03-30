import prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: [],
    parser: "babel",
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("template for callback", () => {
  const result = subject(`
/**
 * @template T
 *      @callback CallbackName
 *  @param {GetStyles<T>} getStyles
 * @returns       {UseStyle<T>}
 */
`);

  expect(result).toMatchSnapshot();
});

test("disabled complex object typedef ", () => {
  const result = subject(`
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

  const result2 = subject(
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

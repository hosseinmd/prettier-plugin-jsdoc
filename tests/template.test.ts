import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: ["prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    parser: "babel-flow",
    jsdocSeparateReturnsFromParam: true,
    ...options,
  } as AllOptions);
}

test("template for callback", async () => {
  const result = await subject(`
/**
 * @template T
 * @callback CallbackName
 * @param {GetStyles<T>} getStyles
 * @returns {UseStyle<T>}
 */
`);

  expect(result).toMatchSnapshot();

  const result2 = await subject(`
  /**
   * @template T
   * @param {GetStyles<T>} getStyles
   * @returns {UseStyle<T>}
   * @template H
   * @callback CallbackName
   * @param {GetStyles<H>} getStyles
   * @returns {UseStyle<H>}
   */
  `);

  expect(result2).toMatchSnapshot();
});

test("extends", async () => {
  const result = await subject(`
 /**
  * The bread crumbs indicate the navigate path and trigger the active page.
  * @class
  * @typedef {object} props
  * @prop        {any} navigation
  * @extends {PureComponent<props>} 
  */
 export class BreadCrumbs extends PureComponent {}
`);

  expect(result).toMatchSnapshot();
});

test("typeParam for callback", async () => {
  const result = await subject(`
/**
 * @typeParam T
 * @callback CallbackName
 * @param {GetStyles<T>} getStyles
 * @returns {UseStyle<T>}
 */
`);

  expect(result).toMatchSnapshot();
});

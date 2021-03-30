import prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: ["."],
    jsdocSpaces: 1,
    parser: "babel-flow",
    ...options,
  } as AllOptions);
}

test("template for callback", () => {
  const result = subject(`
/**
 * @template T
 * @callback CallbackName
 * @param {GetStyles<T>} getStyles
 * @returns {UseStyle<T>}
 */
`);

  expect(result).toMatchSnapshot();

  const result2 = subject(`
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

test("extends", () => {
  const result = subject(`
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

test("typeParam for callback", () => {
  const result = subject(`
/**
 * @typeParam T
 * @callback CallbackName
 * @param {GetStyles<T>} getStyles
 * @returns {UseStyle<T>}
 */
`);

  expect(result).toMatchSnapshot();
});

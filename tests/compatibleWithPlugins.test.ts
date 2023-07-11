import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "typescript",
    plugins: ["./prettier-plugin-fake/index.js", "prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("Should format regular jsDoc", async () => {
  const result = await subject(`
  import b from "b"
  import {k} from "k"
  import a from "a"

/**
* function example description that was wrapped by hand
* so it have more then one line and don't end with a dot
* REPEATED TWO TIMES BECAUSE IT WAS EASIER to copy
* function example description that was wrapped by hand
* so it have more then one line.
* @return {Boolean} Description for @returns with s
* @param {String|Number} text - some text description that is very long and needs to be wrapped
* @param {String} [defaultValue="defaultTest"] TODO
* @arg {Number|Null} [optionalNumber]
* @private
*@memberof test
@async
* @examples
*   var one = 5
*   var two = 10
*
*   if(one > 2) { two += one }
* @undefiendTag${" "}
* @undefiendTag {number} name des
*/
const testFunction = (text, defaultValue, optionalNumber) => true
`);

  expect(result).toMatchSnapshot();
  expect(await subject(result)).toMatchSnapshot();
});

test("Should format jsDoc default values", async () => {
  const result = await subject(`
/**
* @param {String} [arg1="defaultTest"] foo
* @param {number} [arg2=123] the width of the rectangle
* @param {number} [arg3= 123 ]
* @param {number} [arg4= Foo.bar.baz ]
* @param {number|string} [arg5=123] Something. Default is \`"wrong"\`
*/
`);

  expect(result).toMatchSnapshot();
  expect(await subject(result)).toMatchSnapshot();
});

test("Should convert to single line if necessary", async () => {
  const Result1 = await subject(`/** single line description*/`);
  const Result2 = await subject(`/**
 * single line description
 * @example
 */`);

  const Result3 = await subject(`/**
 * single line description
 * @return {Boolean} Always true
 * @example
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

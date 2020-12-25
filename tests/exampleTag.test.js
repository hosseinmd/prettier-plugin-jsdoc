const prettier = require("prettier");

function subject(code, options = {}) {
  return prettier.format(code, {
    parser: "babel",
    plugins: ["."],
    jsdocSpaces: 1,
    ...options,
  });
}

test("Example javascript code", () => {
  const result = subject(`
/**
* @examples
*   var one = 5
*   var two = 10
*
*   if(one > 2) { two += one }
* @undefiendTag 
* @undefiendTag {number} name des
*/
const testFunction = (text, defaultValue, optionalNumber) => true
`);

  expect(result).toMatchSnapshot();
  expect(subject(result)).toMatchSnapshot();
});

test("empty example", () => {
  const Result2 = subject(`/**
 * single line description
 * @example
 */`);

  const Result3 = subject(`/**
 * single line description
 * @return {Boolean} Always true
 * @example
 */`);

  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

test("examples", () => {
  const options = {
    jsdocKeepUnParseAbleExampleIndent: true,
  };
  const Result1 = subject(
    `/**
 * @example 
 * {testArr: [
 *     1,
 *     2,
 *   ]
 *  }
 */`,
    options,
  );

  const Result2 = subject(
    `/**
 * @example
 * 
 * [{
 *   foo: 1,
 *   foo: 2,
 *   foo: 9,
 * }, {
 *   bar: 1,
 *   bar: 5
 * }]
 */`,
    options,
  );
  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("Example start by xml tag", () => {
  const result = subject(`
  /**
   * @example <caption>TradingViewChart</caption>;
   * 
   * export default Something
   */
`);

  expect(result).toMatchSnapshot();

  const result1 = subject(`
  /**
   * @example <caption>TradingViewChart</caption>
   *
   * function Something(){
   *   return <caption>TradingViewChart</caption>
   * }
   * export default Something
   */
`);

  expect(result1).toMatchSnapshot();
});

test("example json ", () => {
  const result = subject(`
  /**
   * @example {
   *   '0%': '#afc163',
   *   '25%': '#66FF00',
   *   '50%': '#00CC00',     // ====>  linear-gradient(to right, #afc163 0%, #66FF00 25%,
   *   '75%': '#009900',     //         #00CC00 50%, #009900 75%, #ffffff 100%)
   *   '100%': '#ffffff'
   * }
   * @description
   * Then this man came to realize the truth:
   * Besides six pence, there is the moon.
   * Besides bread and butter, there is the bug.
   * And...
   * Besides women, there is the code.
   */
`);

  expect(result).toMatchSnapshot();
});

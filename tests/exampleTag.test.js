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

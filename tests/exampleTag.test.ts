import prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "babel",
    plugins: ["."],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("Example javascript code", () => {
  const result = subject(`
/**
* @examples
*   var one = 5
*   var two = 10

     const resolveDescription = formatDescription(tag, description, tagString, a);
*
*   if(one > 2) { two += one

 }

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

test("examples Json", () => {
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

test("example should be same after few time format ", () => {
  const result = subject(`
  /**
   * @example <caption>with selector</caption>
   *   const $ = ccashio.test(\`
   *     <div id=test>
   *       <p>Hello</p>
   *       <b><p>World</p></b>
   *     </div>
   *   \`);
  */
`);

  const result2 = subject(result);
  const result3 = subject(result2);

  expect(result).toEqual(result2);
  expect(result).toEqual(result3);
});

test("example unParseAble", () => {
  const result = subject(
    `/**
* @example
* Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
*     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
*     // at its original position
*     'comment': { ... },
*     // CSS doesn't have a 'color' token, so this token will be appended
*     'color': /\b(?:red|green|blue)\b/
* });
*/`,
    {
      jsdocKeepUnParseAbleExampleIndent: true,
    },
  );

  expect(result).toMatchSnapshot();
  const result2 = subject(result, {
    jsdocKeepUnParseAbleExampleIndent: true,
  });

  expect(result2).toEqual(result);
  expect(subject(result)).not.toEqual(result);
});

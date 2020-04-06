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

test("JS code should be formatted as usuall", () => {
  const result = subject(`
const variable1 = 1             // No semicolon
const stringVar = "text"        // Wrong quotes
  const indented = 2            // Wrong indentation

// Longer then 80 characters
const someLongList = ['private', 'memberof', 'description', 'example', 'param', 'returns', 'link']`);

  const expected = `const variable1 = 1; // No semicolon
const stringVar = "text"; // Wrong quotes
const indented = 2; // Wrong indentation

// Longer then 80 characters
const someLongList = [
  "private",
  "memberof",
  "description",
  "example",
  "param",
  "returns",
  "link"
];
`;
  expect(result).toEqual(expected);
});

test("Should format regular jsDoc", () => {
  const result = subject(`
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
* @undefiendTag 
* @undefiendTag {number} name des
*/
const testFunction = (text, defaultValue, optionalNumber) => true
`);

  expect(result).toMatchSnapshot();
  expect(subject(result)).toMatchSnapshot();
});

test("Should add empty line after @description and @example description if necessary", () => {
  const Result1 = subject(`/** single line description*/`);

  const Result2 = subject(`/**
 * single line description
 * @example
 */`);

  const Result3 = subject(`/**
 * single line description
 * @return {Boolean} Always true
 * @example
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

test(" undefined|null|void type", () => {
  const Result1 = subject(`/**
 * @return {undefined}
 */`);
  const Expected1 = `/**
 * @returns {undefined}
 */
`;

  const Result2 = subject(`/**
 * @return {null}
 */`);
  const Expected2 = `/**
 * @returns {null}
 */
`;

  const Result3 = subject(`/**
 * @returns { void } 
 */`);
  const Expected3 = `/**
 * @returns {void}
 */
`;

  expect(Result1).toEqual(Expected1);
  expect(Result2).toEqual(Expected2);
  expect(Result3).toEqual(Expected3);
});

test("Should keep defined inner types", () => {
  const Result1 = subject(`/**
 * @param {Array.<String>} test test param
 */`);

  const Result2 = subject(`/**
 * @param {String[]} test Test param
 */`);

  const Result3 = subject(`/**
 * @param {(String|Object)[]} test Test param
 */`);

  const Result4 = subject(`/**
 * @returns {Promise<Number|String|undefined>} test promise
 */`);

  const Result5 = subject(`/**
 * @returns {Object<Number|String|undefined>} test object
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
  expect(Result4).toMatchSnapshot();
  expect(Result5).toMatchSnapshot();
});

test("Sould keep params ordering when more than 10 tags are present", () => {
  const Result1 = subject(`/**
 * description
 * @param {Number} test1 Test param
 * @param {Number} test2 Test param
 * @param {Number|String} test3 Test param
 * @param {?undefined} test4 Test param
 * @param {!undefined} test5 Test param
 * @param {*} test6 Test param
 * @param {?Number} test7 Test param
 * @param {...Number} test8 Test param
 * @param {!Number} test9 Test param
 * @param {String} test10 Test param
 * @param {Array} test11 Test param
 * @returns {Promise<Object<string, number|undefined>>} test return
 */`);

  expect(Result1).toMatchSnapshot();
});

test("Sould keep complex inner types", () => {
  const Result1 = subject(`/**
 * @param {Array<(String|Number)>} test test param
 * @param {Array<Object.<String, Number>>} test test param
 * @param {...Number} test Test param
 * @param {?Number} test Test param
 * @param {?undefined} test Test param
 * @param {!Number} test Test param
 * @param {Number} test Test param
 * @param {Number|String} test Test param
 * @param {undefined} test Test param
 * @param {*} test Test param
 */`);

  const Result2 = subject(`/**
 * @returns {Promise<Object<string, number|undefined>>} test return
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("Should align vertically param|property|returns|yields|throws if option set to true", () => {
  const options = {
    jsdocVerticalAlignment: true,
  };
  const Result1 = subject(
    `/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @yields {Number} yields description
 * @returns {undefined}
 */`,
    options
  );
  const Expected1 = `/**
 * @property {Object}    unalginedProp  Unaligned property descriptin
 * @param    {String}    unalginedParam Unaligned param description
 * @yields   {Number}                   Yields description
 * @returns  {undefined}
 */
`;

  const Result2 = subject(
    `/**
 * @throws {CustomExceptio} unaligned throws description
 * @yields {Number} yields description
 * @return {String} unaligned returns description
 */`,
    options
  );
  const Expected2 = `/**
 * @throws  {CustomExceptio} Unaligned throws description
 * @yields  {Number}         Yields description
 * @returns {String}         Unaligned returns description
 */
`;

  expect(Result1).toEqual(Expected1);
  expect(Result2).toEqual(Expected2);
});

test("Should align vertically param|property|returns|yields|throws if option set to true, and amount of spaces is different than default", () => {
  const options1 = {
    jsdocVerticalAlignment: true,
    jsdocSpaces: 2,
  };
  const unformattedJsdoc = `/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @throws {CustomExceptio} unaligned throws description
 * @yields {Number} yields description
 * @returns {undefined}
 */`;
  const Result1 = subject(unformattedJsdoc, options1);

  const options2 = {
    jsdocVerticalAlignment: true,
    jsdocSpaces: 4,
  };
  const Result2 = subject(
    `/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @throws {CustomExceptio} unaligned throws description
 * @yields {Number} yields description
 * @returns {String} unaligned returns description
 */`,
    options2
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("Should insert proper amount of spaces based on option", () => {
  const options1 = {
    jsdocSpaces: 2,
  };
  const Result1 = subject(
    `/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`,
    options1
  );

  const options2 = {
    jsdocSpaces: 3,
  };
  const Result2 = subject(
    `/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`,
    options2
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("yields should work like returns tag", () => {
  const options = {
    jsdocSpaces: 3,
  };
  const Result1 = subject(
    `/**
 * @yields {Number} yields description
 */`,
    options
  );

  const Result2 = subject(
    `/**
 * @yield {Number} yields description
 */`,
    options
  );

  const Result3 = subject(
    `/**
 * @yield {Number}
 */`,
    options
  );

  const Result4 = subject(
    `/**
 * @yield yelds description
 */`,
    options
  );

  const Result5 = subject(
    `/**
 * @yield
 */`,
    options
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
  expect(Result4).toMatchSnapshot();
  expect(Result5).toMatchSnapshot();
});

test("examples", () => {
  const options = {
    jsdocKeepUnparseableExampleIndent: true,
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
    options
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
    options
  );
  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

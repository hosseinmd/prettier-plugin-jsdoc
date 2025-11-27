import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "babel",
    plugins: ["prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("Example javascript code", async () => {
  const result = await subject(`
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
  expect(await subject(result)).toMatchSnapshot();
});

test("empty example", async () => {
  const Result2 = await subject(`/**
 * single line description
 * @example
 */`);

  const Result3 = await subject(`/**
 * single line description
 * @return {Boolean} Always true
 * @example
 */`);

  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

test("examples Json", async () => {
  const options = {
    jsdocKeepUnParseAbleExampleIndent: true,
  };
  const Result1 = await subject(
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

  const Result2 = await subject(
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

test("Example start by xml tag", async () => {
  const result = await subject(`
  /**
   * @example <caption>TradingViewChart</caption>;
   * 
   * export default Something
   */
`);

  expect(result).toMatchSnapshot();

  const result1 = await subject(`
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

test("example json ", async () => {
  const result = await subject(`
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

test("example should be same after few time format ", async () => {
  const result = await subject(`
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

  const result2 = await subject(result);
  const result3 = await subject(result2);

  expect(result).toEqual(result2);
  expect(result).toEqual(result3);
});

test("example unParseAble", async () => {
  const result = await subject(
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
  const result2 = await subject(result, {
    jsdocKeepUnParseAbleExampleIndent: true,
  });

  expect(result2).toEqual(result);
  expect(await subject(result)).not.toEqual(result);
});

test("example with @this tag preserves indentation", async () => {
  const code = `/**
 * @example
 *   import { createServer } from "node:http";
 *   import extendedResponse from "extended-response";
 *
 *   async function* messages() {
 *     for (let i = 1; i <= 5; i++) {
 *       yield \`Message \${i}\\r\\n\`;
 *       await new Promise((resolve) => setTimeout(resolve, 1000));
 *     }
 *   }
 *
 *   const server = createServer(async (req, res) => {
 *     if (
 *       req.method === "GET" &&
 *       new URL(req.url || "").pathname === "/stream5"
 *     ) {
 *       await extendedResponse.call(res, {
 *         messages,
 *       });
 *     }
 *   });
 *
 *   server.listen(port, () => {
 *     console.log(\`Server running on http://localhost:\${port}\`);
 *   });
 *
 * @param {object} params Extended Response Parameters
 * @param {AsyncIterable<message>} params.messages Async messages to be sent
 *   response stream will be closed
 * @returns {Promise<void>}
 *
 * @this {ServerResponse}
 * A Node.js HTTP
 * {@link https://nodejs.org/api/http.html#class-httpserverresponse|ServerResponse}
 * instance.
 */`;

  const result = await subject(code, {
    jsdocTagsOrder: '{"this":39.9}' as any,
    jsdocKeepUnParseAbleExampleIndent: true,
  });

  expect(result).toMatchSnapshot();

  // Format again to ensure it's stable
  const result2 = await subject(result, {
    jsdocTagsOrder: '{"this":39.9}' as any,
    jsdocKeepUnParseAbleExampleIndent: true,
  });

  // The example should preserve its indentation
  expect(result2).toMatchSnapshot();
  expect(result2).toContain("  import { createServer }");
  expect(result2).toContain("    for (let i = 1; i <= 5; i++)");
});

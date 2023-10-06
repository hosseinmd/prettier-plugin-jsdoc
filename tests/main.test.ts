import { format } from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return format(code, {
    parser: "babel",
    plugins: ["prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("JS code should be formatted as usuall", async () => {
  const result = await subject(`
const variable1 = 1             // No semicolon
const stringVar = "text"        // Wrong quotes
  const indented = 2            // Wrong indentation

// Longer then 80 characters
const someLongList = ['private', 'memberof', 'description', 'example', 'param', 'returns', 'link']`);

  expect(result).toMatchSnapshot();
});

test("Should format regular jsDoc", async () => {
  const result = await subject(`
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

  const result2 = await subject(
    `
/**
* @param {String} [arg1="defaultTest"] foo
* @param {number} [arg2=123] the width of the rectangle
* @param {number} [arg3= 123 ]
* @param {number} [arg4= Foo.bar.baz ]
* @param {number|string} [arg5=123] Something. Default is \`"wrong"\`
*/
`,
    {
      jsdocAddDefaultToDescription: false,
    },
  );

  expect(result2).toMatchSnapshot();
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

test("Should convert to single multiLine", async () => {
  const Result1 = await subject(`/** single line description*/`, {
    jsdocCommentLineStrategy: "multiline",
  });
  const Result2 = await subject(
    await subject(`/**
 * single line description
 * @example
 */`),
    {
      jsdocCommentLineStrategy: "multiline",
    },
  );

  const Result3 = await subject(
    `/**
 * single line description
 * @return {Boolean} Always true
 * @example
 */`,
    {
      jsdocSingleLineComment: false,
    },
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

test(" undefined|null|void type", async () => {
  const Result1 = await subject(`/**
 * @return {undefined}
 */`);

  const Result2 = await subject(`/**
 * @return {null}
 */`);

  const Result3 = await subject(`/**
 * @returns { void }${" "}
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

test("Should keep defined inner types", async () => {
  const Result1 = await subject(`/**
 * @param {Array.<String>} test test param
 */`);

  const Result2 = await subject(`/**
 * @param {String[]} test Test param
 */`);

  const Result3 = await subject(`/**
 * @param {(String|Object)[]} test Test param
 */`);

  const Result4 = await subject(`/**
 * @returns {Promise<Number|String|undefined>} test promise
 */`);

  const Result5 = await subject(`/**
 * @returns {Object<Number|String|undefined>} test object
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
  expect(Result4).toMatchSnapshot();
  expect(Result5).toMatchSnapshot();
});

test("Sould keep params ordering when more than 10 tags are present", async () => {
  const Result1 = await subject(`/**
 * description
 * @param {Number} test1 Test param
 * @param {Number} test2 Test param
 * @param {Number|String} test3 Test param
 * @param {?undefined} test4 Test param
 * @param {!undefined} test5 Test param
 * @param {*} test6 Test param
 * @param {"*"} test6 Test param
 * @param {?Number} test7 Test param
 * @param {...Number} test8 Test param
 * @param {!Number} test9 Test param
 * @param {String} test10 Test param
 * @param {Array} test11 Test param
 * @returns {Promise<Object<string, number|undefined>>} test return
 */`);

  expect(Result1).toMatchSnapshot();
});

test("Sould keep complex inner types", async () => {
  const Result1 = await subject(`/**
 * @param {Array<(String|Number)>} test test param
 * @param {Array<Object.<String, Number>>} test test param
 * @param {...Number} test Test param
 * @todo  todo is no param
 * @param {?Number} test Test param
 * @param {?undefined} test Test param
 * @param {!Number} test Test param
 * @param {Number} test Test param
 * @param {Number|String} test Test param
 * @param {undefined} test Test param
 * @param {*} test Test param
 */`);

  const Result2 = await subject(`/**
 * @returns {Promise<Object<string, number|undefined>>} test return
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("Should align vertically param|property|returns|yields|throws if option set to true", async () => {
  const options = {
    jsdocVerticalAlignment: true,
  };
  const Result1 = await subject(
    `/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @yields {Number} yields description
 * @returns {undefined}
 */`,
    options,
  );
  const Expected1 = `/**
 * @property {Object}    unalginedProp  Unaligned property descriptin
 * @param    {String}    unalginedParam Unaligned param description
 * @yields   {Number}                   Yields description
 * @returns  {undefined}
 */
`;

  const Result2 = await subject(
    `/**
 * @throws {CustomExceptio} unaligned throws description
 * @yields {Number} yields description
 * @return {String} unaligned returns description
 */`,
    options,
  );
  const Expected2 = `/**
 * @yields  {Number}         Yields description
 * @returns {String}         Unaligned returns description
 * @throws  {CustomExceptio} Unaligned throws description
 */
`;

  expect(Result1).toEqual(Expected1);
  expect(Result2).toEqual(Expected2);
});

test("Should align vertically param|property|returns|yields|throws if option set to true, and amount of spaces is different than default", async () => {
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
  const Result1 = await subject(unformattedJsdoc, options1);

  const options2 = {
    jsdocVerticalAlignment: true,
    jsdocSpaces: 4,
  };
  const Result2 = await subject(
    `/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @throws {CustomExceptio} unaligned throws description
 * @yields {Number} yields description
 * @returns {String} unaligned returns description
 */`,
    options2,
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("Should insert proper amount of spaces based on option", async () => {
  const options1 = {
    jsdocSpaces: 2,
  };
  const Result1 = await subject(
    `/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`,
    options1,
  );

  const options2 = {
    jsdocSpaces: 3,
  };
  const Result2 = await subject(
    `/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`,
    options2,
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
});

test("yields should work like returns tag", async () => {
  const options = {
    jsdocSpaces: 3,
  };
  const Result1 = await subject(
    `/**
 * @yields {Number} yields description
 */`,
    options,
  );

  const Result2 = await subject(
    `/**
 * @yield {Number} yields description
 */`,
    options,
  );

  const Result3 = await subject(
    `/**
 * @yield {Number}
 */`,
    options,
  );

  const Result4 = await subject(
    `/**
 * @yield yelds description
 */`,
    options,
  );

  const Result5 = await subject(
    `/**
 * @yield
 */`,
    options,
  );

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
  expect(Result4).toMatchSnapshot();
  expect(Result5).toMatchSnapshot();
});
test("Big single word", async () => {
  const result = await subject(
    `/**
    * Simple Single Word
    * https://github.com/babel/babel/pull/7934/files#diff-a739835084910b0ee3ea649df5a4d223R67
   */`,
  );

  expect(result).toMatchSnapshot();
});

test("Hyphen at the start of description", async () => {
  const result = await subject(`
/**
 * Assign the project to an employee.
 * @param {Object} employee - The employee who is responsible for the project.
 * @param {string} employee.name - The name of the employee.
 * @param {string} employee.department - The employee's department.
 */
`);

  expect(result).toMatchSnapshot();
});

test("Bad defined name", async () => {
  const result = await subject(`
  /** @type{import('@jest/types/build/Config').InitialOptions} */
  /** @type{{foo:string}} */

  /** @typedef{import('@jest/types/build/Config').InitialOptions} name a description  */
`);

  expect(result).toMatchSnapshot();
});

test("Long description memory leak", async () => {
  const result = await subject(`
  /** Configures custom logging for the {@link @microsoft/signalr.HubConnection}.
   *
   * https://example.com
   * @param {LogLevel | string | ILogger} logging A {@link @microsoft/signalr.LogLevel}, a string representing a LogLevel, or an object implementing the {@link @microsoft/signalr.ILogger} interface.
   *    See {@link https://docs.microsoft.com/aspnet/core/signalr/configuration#configure-logging|the documentation for client logging configuration} for more details.
   * @returns The {@link @microsoft/signalr.HubConnectionBuilder} instance, for chaining.
   */
`);

  expect(result).toMatchSnapshot();
});

test("since ", async () => {
  const result = await subject(`
  /**
   * @since 3.16.0
   */
`);

  expect(result).toMatchSnapshot();
});

test("Incorrect comment", async () => {
  const result = await subject(`
  /***
   * Some comment
   */
  export class Dummy {}
  `);

  const result2 = await subject(`
  /**
   *
   */
  export class Dummy {}
  `);

  expect(result).toMatchSnapshot();
  expect(result2).toMatchSnapshot();
});

test("Empty comment", async () => {
  const result = await subject(`
  // Line Comment
  //
  `);

  expect(result).toMatchSnapshot();
});

test("Optional parameters", async () => {
  const result = await subject(`
  /**
   * @param {number=} arg1
   * @param {number} [arg2]
   * @param {number} [arg3=4]
   */
  `);

  expect(result).toMatchSnapshot();
});

test("Non-jsdoc comment", async () => {
  const result = await subject(`
  // @type   { something  }
  /* @type   { something  }  */
  /* /** @type   { something  }  */
  `);

  expect(result).toMatchSnapshot();
});

test("Format rest parameters properly", async () => {
  const result = await subject(`
  /**
   * @param {... *} arg1
   * @param {... number} arg2
   * @param {... (string|number)} arg3
   * @param {... string|number} arg4 This is equivalent to arg3
   *
   */
  function a(){}
  `);

  expect(result).toMatchSnapshot();
});

test("Line ends", async () => {
  const text = `
  /**
   * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
   * @param {Object} paramName param description that goes on and on and on until it will need to be wrapped
   *
   */
  function a(){}`;
  const formatted = `/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
 * tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} paramName Param description that goes on and on and on
 *   until it will need to be wrapped
 */
function a() {}
`;

  const text_crlf = text.replace(/\n/g, "\r\n");
  const text_lf = text;
  const formatted_crlf = formatted.replace(/\n/g, "\r\n");
  const formatted_lf = formatted;

  expect(await subject(text_lf, { endOfLine: "crlf" })).toEqual(formatted_crlf);
  expect(await subject(text_lf, { endOfLine: "lf" })).toEqual(formatted_lf);

  expect(await subject(text_crlf, { endOfLine: "crlf" })).toEqual(
    formatted_crlf,
  );
  expect(await subject(text_crlf, { endOfLine: "lf" })).toEqual(formatted_lf);

  expect(await subject(text_lf, { endOfLine: "auto" })).toEqual(formatted_lf);
  expect(await subject(text_crlf, { endOfLine: "auto" })).toEqual(
    formatted_crlf,
  );
});

test("param order", async () => {
  const result = await subject(`
  /**
* @param {  string   }    param0 description
* @param {  number   }    param2 description
* @param {  object   }    param1 description
   */
function fun(param0, param1, param2){}

export const SubDomain = {
/**
 * @param {} subDomainAddress2
 * @param {any} subDomainAddress
* @returns {import('axios').AxiosResponse<import('../types').SubDomain>} 
*/
async subDomain(subDomainAddress2,subDomainAddress) {
},
};
 

/**
 * @param {  string   }    param0 description
 * @param {  number   }    param2 description
 * @param {  object   }    param1 description
    */
 const fun=(param0, param1, param2)=>{
   console.log('')
 }
  
`);

  expect(result).toMatchSnapshot();

  const result2 = await subject(
    `
 /**
 * @param {object} c      - Options.
 * @param {string} a      - A for foo.
 * @param {object} opts   - Options.
 * @param {string} opts.b - Option b.
 * @param {string} opt2 - Option b.
 * @param {string} v - Option b.
 */
const foo = (a,c, { b }, v, opt2) => {
  console.log(a,v,c, b);
};
foo('a', { b: 'b' });
  
`,
    {
      jsdocVerticalAlignment: true,
    },
  );

  expect(result2).toMatchSnapshot();

  const result3 = await subject(
    `
 /**
 * @param {  string   }    param0 description
 * @param {  number   }    param2 description
 * @param {  object   }    param1 description
    */
 const fun=((param0: ()=>{}, param1:number, param2)=>{
   console.log('')
 })

/**
 * @param {  string   }    param0 description
 * @param {  number   }    param2 description
 * @param {  object   }    param1 description
    */
 function fun(param0:string, param1:{}, param2:()=>{}){}
 `,
    {
      parser: "babel-ts",
    },
  );

  expect(result3).toMatchSnapshot();
});

test("jsdoc tags", async () => {
  const result2 = await subject(
    `/**
    * @namespace
    * @borrows trstr as trim
    */   

  /**
    * Whether the type should be non null, \`required: true\` = \`nullable: false\`
    *
    * @default (depends on whether nullability is configured in type or schema)
    * @see declarativeWrappingPlugin
    */
`,
  );

  expect(result2).toMatchSnapshot();

  const result3 = await subject(
    `
/**
 * @default 'i am a value' i am the description
*/   
`,
  );

  expect(result3).toMatchSnapshot();
});

test("example ", async () => {
  const result2 = await subject(
    `
/**
 * ABCCCC
 *
 * @example <caption>DDDD</caption>
 *
 *   const MyHook = () => {
 *     const config useConfig(state => state.config)
 *     return <span></span>
 *   }
 *
 *   const useMyHook = () => {
 *     const config useConfig(state => state.config)
 *     return config
 *   }
 *
 * @example <caption>AAAA</caption>
 *   const config = useConfig.getState().config
 */
`,
  );

  expect(await subject(await subject(result2))).toMatchSnapshot();
});

test("example with tab intention", async () => {
  const result2 = await subject(
    `
/**
 * @example
 * 	function Hello() {
 * 		console.log("Hello World");
 * 	}
 */
    
`,
    {
      useTabs: true,
    },
  );

  expect(
    await subject(
      await subject(result2, {
        useTabs: true,
      }),
      {
        useTabs: true,
      },
    ),
  ).toMatchSnapshot();
});

test("Optional params", async () => {
  const result = await subject(`
/**
 * @param {string=} p2 - An optional param (Google Closure syntax)
 * @param {string} [p3] - Another optional param (JSDoc syntax).
 * @returns {string=} 
*/
`);

  expect(result).toMatchSnapshot();
});

test("non-escapable character", async () => {
  const result = await subject(`
  /**
   * \\\\
   * 
   * 
   * \\\\-
   */
  `);

  expect(result).toMatchSnapshot();

  const result2 = await subject(`
  /**
   * \\\\
   */
  `);

  expect(result2).toMatchSnapshot();
});

test("@file", async () => {
  const result = await subject(`
  /** @file A file description */
`);

  expect(result).toMatchSnapshot();
});

test("Block quote", async () => {
  const result = await subject(`
  /** > A block quote */
`);

  expect(result).toMatchSnapshot();

  const result2 = await subject(`
  /**
   *  > \`\`\`js
   *  > > A block quote
   *  > \`\`\`
   *  > 
   *  > turns into
   *  > 
   *  > \`\`\`js
   *  > A block quote 
   *  > \`\`\`
   *  
   *  sdssasdassd
   *   
   */
`);

  expect(result2).toMatchSnapshot();
});

test("File with just an import", async () => {
  const result = await subject(
    `
import { something } from './index';
`,
    {
      jsdocDescriptionWithDot: true,
      jsdocCommentLineStrategy: "multiline",
      jsdocSeparateTagGroups: true,
      jsdocPreferCodeFences: true,
      tsdoc: true,
    },
  );

  expect(await subject(await subject(result))).toMatchSnapshot();
});

test("satisfies", async () => {
  const result = await subject(`
  /**
   * Bounce give a renderContent and show that around children when isVisible is
   * true
   *
   * @satisfies {React.FC<BounceProps>}
   * @example
   *   <Bounce
   *     isVisible={isVisible}
   *     dismiss={() => setVisible(false)}
   *     renderContent={() => {
   *       return <InsideOfPopeUp />;
   *     }}>
   *     <Button />
   *   </Bounce>;
   *
   * @type {React.FC<BounceProps>}
   */
   `);

  expect(result).toMatchSnapshot();
});

test("default type parameter ", async () => {
  function _subject(str: string) {
    return subject(str, {
      jsdocAddDefaultToDescription: true,
    });
  }
  const result = await _subject(
    `
    /**
     * @template [BAR=({bar:true}&{foo:false}&{buggy:true})] 
     * @typedef {{foo: BAR}} SomeType
     */
`,
  );

  expect(await _subject(await _subject(result))).toMatchSnapshot();
});

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

test("JS code should be formatted as usuall", () => {
  const result = subject(`
const variable1 = 1             // No semicolon
const stringVar = "text"        // Wrong quotes
  const indented = 2            // Wrong indentation

// Longer then 80 characters
const someLongList = ['private', 'memberof', 'description', 'example', 'param', 'returns', 'link']`);

  expect(result).toMatchSnapshot();
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
* @undefiendTag${" "}
* @undefiendTag {number} name des
*/
const testFunction = (text, defaultValue, optionalNumber) => true
`);

  expect(result).toMatchSnapshot();
  expect(subject(result)).toMatchSnapshot();
});

test("Should format jsDoc default values", () => {
  const result = subject(`
/**
* @param {String} [arg1="defaultTest"] foo
* @param {number} [arg2=123] the width of the rectangle
* @param {number} [arg3= 123 ]
* @param {number} [arg4= Foo.bar.baz ]
* @param {number|string} [arg5=123] Something. Default is \`"wrong"\`
*/
`);

  expect(result).toMatchSnapshot();
  expect(subject(result)).toMatchSnapshot();

  const result2 = subject(
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

test("Should convert to single line if necessary", () => {
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

test("Should convert to single multiLine", () => {
  const Result1 = subject(`/** single line description*/`, {
    jsdocSingleLineComment: false,
  });
  const Result2 = subject(
    subject(`/**
 * single line description
 * @example
 */`),
    {
      jsdocSingleLineComment: false,
    },
  );

  const Result3 = subject(
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

test(" undefined|null|void type", () => {
  const Result1 = subject(`/**
 * @return {undefined}
 */`);

  const Result2 = subject(`/**
 * @return {null}
 */`);

  const Result3 = subject(`/**
 * @returns { void }${" "}
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
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

test("Sould keep complex inner types", () => {
  const Result1 = subject(`/**
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
    options,
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
    options2,
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
    options1,
  );

  const options2 = {
    jsdocSpaces: 3,
  };
  const Result2 = subject(
    `/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`,
    options2,
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
    options,
  );

  const Result2 = subject(
    `/**
 * @yield {Number} yields description
 */`,
    options,
  );

  const Result3 = subject(
    `/**
 * @yield {Number}
 */`,
    options,
  );

  const Result4 = subject(
    `/**
 * @yield yelds description
 */`,
    options,
  );

  const Result5 = subject(
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
test("Big single word", () => {
  const result = subject(
    `/**
    * Simple Single Word
    * https://github.com/babel/babel/pull/7934/files#diff-a739835084910b0ee3ea649df5a4d223R67
   */`,
  );

  expect(result).toMatchSnapshot();
});

test("Hyphen at the start of description", () => {
  const result = subject(`
/**
 * Assign the project to an employee.
 * @param {Object} employee - The employee who is responsible for the project.
 * @param {string} employee.name - The name of the employee.
 * @param {string} employee.department - The employee's department.
 */
`);

  expect(result).toMatchSnapshot();
});

test("Bad defined name", () => {
  const result = subject(`
  /** @type{import('@jest/types/build/Config').InitialOptions} */
  /** @type{{foo:string}} */

  /** @typedef{import('@jest/types/build/Config').InitialOptions} name a description  */
`);

  expect(result).toMatchSnapshot();
});

test("Long description memory leak", () => {
  const result = subject(`
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

test("since ", () => {
  const result = subject(`
  /**
   * @since 3.16.0
   */
`);

  expect(result).toMatchSnapshot();
});

test("Incorrect comment", () => {
  const result = subject(`
  /***
   * Some comment
   */
  export class Dummy {}
  `);

  const result2 = subject(`
  /**
   *
   */
  export class Dummy {}
  `);

  expect(result).toMatchSnapshot();
  expect(result2).toMatchSnapshot();
});

test("Empty comment", () => {
  const result = subject(`
  // Line Comment
  //
  `);

  expect(result).toMatchSnapshot();
});

test("Optional parameters", () => {
  const result = subject(`
  /**
   * @param {number=} arg1
   * @param {number} [arg2]
   * @param {number} [arg3=4]
   */
  `);

  expect(result).toMatchSnapshot();
});

test("Non-jsdoc comment", () => {
  const result = subject(`
  // @type   { something  }
  /* @type   { something  }  */
  /* /** @type   { something  }  */
  `);

  expect(result).toMatchSnapshot();
});

test("Format rest parameters properly", () => {
  const result = subject(`
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

test("Line ends", () => {
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

  expect(subject(text_lf, { endOfLine: "crlf" })).toEqual(formatted_crlf);
  expect(subject(text_lf, { endOfLine: "lf" })).toEqual(formatted_lf);

  expect(subject(text_crlf, { endOfLine: "crlf" })).toEqual(formatted_crlf);
  expect(subject(text_crlf, { endOfLine: "lf" })).toEqual(formatted_lf);

  expect(subject(text_lf, { endOfLine: "auto" })).toEqual(formatted_lf);
  expect(subject(text_crlf, { endOfLine: "auto" })).toEqual(formatted_crlf);
});

test("param order", () => {
  const result = subject(`
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
 function fun(param0:string, param1:{}, param2:()=>{}){}
 

/**
 * @param {  string   }    param0 description
 * @param {  number   }    param2 description
 * @param {  object   }    param1 description
    */
 const fun=(param0, param1, param2)=>{
   console.log('')
 }


 /**
 * @param {  string   }    param0 description
 * @param {  number   }    param2 description
 * @param {  object   }    param1 description
    */
 const fun=((param0: ()=>{}, param1:number, param2)=>{
   console.log('')
 })
  
`);

  expect(result).toMatchSnapshot();

  const result2 = subject(
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
});

test("jsdoc tags", () => {
  const result2 = subject(
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
});

test("example ", () => {
  const result2 = subject(
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

  expect(subject(subject(result2))).toMatchSnapshot();
});

test("example with tab intention", () => {
  const result2 = subject(
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
    subject(
      subject(result2, {
        useTabs: true,
      }),
      {
        useTabs: true,
      },
    ),
  ).toMatchSnapshot();
});

test("Optional params", () => {
  const result = subject(`
/**
 * @param {string=} p2 - An optional param (Google Closure syntax)
 * @param {string} [p3] - Another optional param (JSDoc syntax).
 * @returns {string=} 
*/
`);

  expect(result).toMatchSnapshot();
});

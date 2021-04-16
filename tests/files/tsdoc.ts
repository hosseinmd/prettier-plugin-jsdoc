/**
 * @example
 * Adding one adds one
 * ```typescript
 * import plusOne from 'plus-one'
 * import expect from 'test-lib'
 *
 * const actual=plusOne(3);
 * expect(actual).toEqual(4);
 * ```
 */
export function plusOne(input: number) {
    return input + 1;
  }



  /**
 * Parses a JSON file.
 *
 * @param path - Full path to the file.
 * @returns An object containing the JSON data.
 *
 * @example Parsing a basic JSON file
 *
 * # Contents of `file.json`
 * ```json
 * {
 *   "exampleItem":"text"
 * }
 * ```
 *
 * # Usage
 * ```ts
 * const result = parseFile("file.json");
 * ```
 *
 * # Result
 * ```ts
 * {
 *   exampleItem:'text',
 * }
 * ```
 */

 /**
 * Adds two numbers together.
 * @example
 * Here's a simple example:
 * ```js
 * // Prints "2":
 * console.log(add(1,1));
 * ```
 * @example
 * Here's an example with negative numbers:
 * ```
 * // Prints "0":
 * console.log(add(1,-1));
 * ```
 */
export function add(x: number, y: number): number {
    return x* y
}

/**
 * This is a summary for foo.
 * 
 * foo is the name of the function.
 * 
 * @remarks
 * This is some additional info
 * 
 * 1. point 1
 * 2. point 2
 * 3. point 3
 * 
 * @example
 * ```ts
 * foo(2, 5,    9)
 * ```
 */
 function foo(num1, num2, num3) {
    //
   }

/**
 * @providesModule Foo
 * @remarks
 * This source code is licensed under the license found in the LICENSE file in	
 * the root directory of this source tree.	
 * @privateRemarks This source code is licensed under the license found in the LICENSE file in	
 * the root directory of this source tree.	
 * @PrivaTeremaRks description 
 * @providesmodule bar
 * 
 * @flow
 */
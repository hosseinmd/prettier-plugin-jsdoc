import prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: ["."],
    parser: "babel-ts",
    ...options,
  } as AllOptions);
}

test("description contain paragraph", () => {
  const result = subject(`
/**
 * Does the following things:
 * 
 *    1. Thing 1
 * 
 *    2. Thing 2
 * 
 *    3. Thing 3
 */
    `);

  expect(result).toMatchSnapshot();

  const result2 = subject(`
  /**
   * Does the following things:
   * 
   *    1. Thing 1
   *    2. Thing 2
   *    3. Thing 3
   */
      `);

  expect(result2).toMatchSnapshot();

  const result3 = subject(`
  class test {
    /**
     * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
     *  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
     *
     *  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
     *
     * lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
     *    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
     */
    a(){}
  }
  `);
  expect(result3).toMatchSnapshot();

  const result4 = subject(`
  /**
   * Transforms data
   *
   * @override
   */
   

  /**
   * Bounce give a renderContent and show that around children when isVisible is
   * true
   *
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
  
   /**
    * @param {string} a
    *
    * \`\`\`js
    * var a = 0;
    * \`\`\`
    */
   `);

  expect(result4).toMatchSnapshot();
});

test("description new line with dash", () => {
  const result1 = subject(`
  /**
   * We will allow the scroll view to give up its lock iff it acquired the lock
   * during an - animation. This is a very useful default that happens to satisfy
   * many common user experiences.
   *
   * - Stop a scroll on the left edge, then turn that into an outer view's
   *   backswipe.
   * - Stop a scroll mid-bounce at the top, continue pulling to have the outer
   *   view dismiss.
   * - However, without catching the scroll view mid-bounce (while it is
   *   motionless), if you drag far enough for the scroll view to become
   *   responder (and therefore drag the scroll view a bit), any backswipe
   *   navigation of a swipe gesture higher in the view hierarchy, should be
   *   rejected.
   */
  function scrollResponderHandleTerminationRequest() {
    return !this.state.observedScrollSinceBecomingResponder;
  }



  /**
   * - stop a scroll on the left edge, then turn that into an outer view's
   *   backswipe.
   * - Stop a scroll mid-bounce at the top, continue pulling to have the outer
   *   view dismiss.
   */
  function scrollResponderHandleTerminationRequest() {
    return !this.state.observedScrollSinceBecomingResponder;
  }

  /**- stop a scroll on the left edge, then turn that into an outer view's
   *   backswipe.
   * - Stop a scroll mid-bounce at the top, continue pulling to have the outer
   *   view dismiss.
   */
  function scrollResponderHandleTerminationRequest() {
    return !this.state.observedScrollSinceBecomingResponder;
  }
  `);
  expect(result1).toMatchSnapshot();

  const result2 = subject(`
  /**
   * Measures the \`HitRect\` node on activation. The Bounding rectangle is with
   * respect to viewport - not page, so adding the \`pageXOffset/pageYOffset\`
   * should result in points that are in the same coordinate system as an
   * event's \`globalX/globalY\` data values.
   *
   * - Consider caching this for the lifetime of the component, or possibly being able to share this
   *   cache between any \`ScrollMap\` view.
   *
   * @private
   *
   * @sideeffects
   */
  `);

  expect(result2).toMatchSnapshot();

  const result3 = subject(`
  /**
   * Handles parsing of a test case file.
   *
   *
   * A test case file consists of at least two parts, separated by a line of dashes.
   * This separation line must start at the beginning of the line and consist of at least three dashes.
   *
   * The test case file can either consist of two parts:
   *
   *     const a='' 
   *     const b={c:[]} 
   *
   *
   * or of three parts:
   *
   *     {source code}
   *     ----
   *     {expected token stream}
   *     ----
   *     {text comment explaining the test case}
   *
   * If the file contains more than three parts, the remaining parts are just ignored.
   * If the file however does not contain at least two parts (so no expected token stream),
   * the test case will later be marked as failed.
   *
   *
   */
  `);

  expect(result3).toMatchSnapshot();
});

test("numbers and code in description", () => {
  const result1 = subject(`
/**
 * =========================== PressResponder Tutorial ===========================
 *
 * The \`PressResponder\` class helps you create press interactions by analyzing the
 * geometry of elements and observing when another responder (e.g. ScrollView)
 * has stolen the touch lock. It offers hooks for your component to provide
 * interaction feedback to the user:
 *
 * - When a press has activated (e.g. highlight an element)
 * - When a press has deactivated (e.g. un-highlight an element)
 * - When a press sould trigger an action, meaning it activated and deactivated while within the geometry of the element without the lock being stolen.
 *
 * A high quality interaction isn't as simple as you might think. There should
 * be a slight delay before activation. Moving your finger beyond an element's
 * bounds should trigger deactivation, but moving the same finger back within an
 * element's bounds should trigger reactivation.
 *
 * 1- In order to use \`PressResponder\`, do the following:
 *\`\`\`js
 *     const pressResponder = new PressResponder(config);
 *\`\`\`
 *   2.   Choose the rendered component who should collect the press events. On that
 *   element, spread \`pressability.getEventHandlers()\` into its props.
 *\`\`\`js
 *    return (
 *      <View {...this.state.pressResponder.getEventHandlers()} />
 *    );
 *\`\`\`
 * 3. Reset \`PressResponder\` when your component unmounts.
 *\`\`\`js
 *    componentWillUnmount() {
 *      this.state.pressResponder.reset();
 *    }
 *\`\`\`
 * ==================== Implementation Details ====================
 *
 * \`PressResponder\` only assumes that there exists a \`HitRect\` node. The \`PressRect\`
 * is an abstract box that is extended beyond the \`HitRect\`.
 *
 * # Geometry
 *  When the press is released outside the \`HitRect\`,
 *  the responder is NOT eligible for a "press".
 *
 */
  `);
  expect(subject(subject(result1))).toEqual(result1);

  expect(subject(subject(result1))).toMatchSnapshot();

  const result2 = subject(`
  /**
   * 1-    a keydown event occurred immediately before a focus event
   * 2- a focus event happened on an element which requires keyboard interaction (e.g., a text field);
   * 2- a focus event happened on an element which requires keyboard interaction (e.g., a text field);
   */
`);
  expect(result2).toMatchSnapshot();

  const result3 = subject(
    `
/**
* The script uses two heuristics to determine whether the keyboard is being used:
*
* 1. a keydown event occurred lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliqimmediately before  a focus event;


* 2.   a focus evenlorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliqt happened on an element which requires keyboard interaction (e.g., a text field);
*
* lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliq
* W3C Software Notice and License: https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*/
`,
    {
      jsdocDescriptionWithDot: true,
    },
  );

  expect(
    subject(result3, {
      jsdocDescriptionWithDot: true,
    }),
  ).toEqual(result3);

  expect(result3).toMatchSnapshot();

  const result4 = subject(`
/**
 * Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus.
 *
 * 1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
 * 2. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.
 *
 *    Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui.
 *
 * @public
 */
`);
  expect(result4).toMatchSnapshot();
});

test("Nested list", () => {
  const result1 = subject(
    `
/**
 * 1.  Foo
 *     1.  Entry 1
 *     2.  Entry 2
 *         - Foo
 *         - bar
 *     3.  Entry 3
 * 2.  Bar
 *     1.  Entry 1
 *     2.  Entry 2
 *     3.  Entry 3
 */
`,
  );

  expect(result1).toMatchSnapshot();
});

test("New line with \\", () => {
  const result1 = subject(
    `
/**
 * A short description,\
 * A long description.
 */
`,
  );

  expect(result1).toMatchSnapshot();
  expect(subject(result1)).toEqual(result1);
});

test("List in tags", () => {
  const result1 = subject(
    `
/**
 * @param {any} var An example list:
 *
 *   - Item 1
 *   - Item 2
 *
 * @returns {Promise} A return value.
 */

 /**
  * @param {any} var An example list:
  *
  *   - Item 1
  *   - Item 2
  *
  */
`,
  );

  expect(result1).toMatchSnapshot();
});

test("code in description", () => {
  const result1 = subject(`
/**
 * \`Touchable\`: Taps done right.
 *
 * You hook your \`ResponderEventPlugin\` events into \`Touchable\`. \`Touchable\`
 * will measure time/geometry and tells you when to give feedback to the user.
 *
 * ====================== Touchable Tutorial ===============================
 * The \`Touchable\` mixin helps you handle the "press" interaction. It analyzes 
 *  the geometry of elements, and observes when another responder (scroll view
 * etc) has stolen the touch lock. It notifies your component when it should
 * give feedback to the user. (bouncing/highlighting/unhighlighting).
 *
 * - When a touch was activated (typically you highlight)
 * - When a touch was deactivated (typically you unhighlight)
 * - When a touch was "pressed" - a touch ended while still within the geometry
 *   of the element, and no other element (like scroller) has "stolen" touch
 *   lock ("responder") (Typically you bounce the element).
 *
 * A good tap interaction isn't as simple as you might think. There should be a
 * slight delay before showing a highlight when starting a touch. If a
 * subsequent touch move exceeds the boundary of the element, it should
 * unhighlight, but if that same touch is brought back within the boundary, it
 * should rehighlight again. A touch can move in and out of that boundary
 * several times, each time toggling highlighting, but a "press" is only
 * triggered if that touch ends while within the element's boundary and no
 * scroller (or anything else) has stolen the lock on touches.
 *
 * To create a new type of component that handles interaction using the
 * \`Touchable\` mixin, do the following:
 *
 * - Initialize the \`Touchable\` state.
 *\`\`\`js
 *   getInitialState: function(   ) {
 *     return merge(this.touchableGetInitialState(), yourComponentState);
 *   }
 *\`\`\`
 * - Choose the rendered component who's touches should start the interactive
 *   sequence. On that rendered node, forward all \`Touchable\` responder
 *   handlers. You can choose any rendered node you like. Choose a node whose
 *   hit target you'd like to instigate the interaction sequence:
 *\`\`\`js
 *   // In render function:
 *   return (
 *     <View
 * 
 *       onStartShouldSetResponder={this.touchableHandleStartShouldSetResponder}
 *       onResponderTerminationRequest={this.touchableHandleResponderTerminationRequest}
 *       onResponderGrant={this.touchableHandleResponderGrant}
 *       onResponderMove={this.touchableHandleResponderMove}
 *       onResponderRelease={this.touchableHandleResponderRelease}
 *       onResponderTerminate={this.touchableHandleResponderTerminate}>
 *       <View>
 *         Even though the hit detection/interactions are triggered by the
 *         wrapping (typically larger) node, we usually end up implementing
 *         custom logic that highlights this inner one.
 *       </View>
 *     </View>
 *   );
 *\`\`\`
 * - You may set up your own handlers for each of these events, so long as you
 *   also invoke the \`touchable*\` handlers inside of your custom handler.
 *
 * - Implement the handlers on your component class in order to provide
 *   feedback to the user. See documentation for each of these class methods
 *   that you should implement.
 *\`\`\`js
 *   touchableHandlePress: function() {
 *      this.performBounceAnimation();  // or whatever you want to do.
 *   },
 *   touchableHandleActivePressIn: function() {
 *     this.beginHighlighting(...);  // Whatever you like to convey activation
 *   },
 *   touchableHandleActivePressOut: function() {
 *     this.endHighlighting(...);  // Whatever you like to convey deactivation
 *   },
 *\`\`\`
 * - There are more advanced methods you can implement (see documentation below):
 * \`\`\`js
 *   touchableGetHighlightDelayMS: function() {
 *     return 20;
 *   }
 *   // In practice, *always* use a predeclared constant (conserve memory).
 *   touchableGetPressRectOffset: function() {
 *     return {top: 20, left: 20, right: 20, bottom: 100};
 *   }
 * \`\`\`
 */
  `);

  expect(result1).toMatchSnapshot();

  const result2 = subject(
    subject(`
    /**
     * Utility type for getting the values for specific style keys.
     * # test:
     * The following is bad because position is more restrictive than 'string':
     * \`\`\`
     * type Props = {position: string};
     * \`\`\`
     *
     * You should use the following instead:
     *
     * \`\`\`
     * type Props = {position: TypeForStyleKey<'position'>};
     * \`\`\`
     *
     * This will correctly give you the type 'absolute' | 'relative'
     */
`),
  );

  expect(subject(subject(result2))).toEqual(result2);

  expect(result2).toMatchSnapshot();
});

test("printWidth", () => {
  const result1 = subject(
    `/**
  * A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A
  * A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A
  * A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A
  *
  * A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A
  * A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A
  * A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A
  */`,
    {
      jsdocPrintWidth: 80,
    },
  );

  expect(subject(subject(result1))).toEqual(result1);

  expect(result1).toMatchSnapshot();
});

test("description start underscores", () => {
  const result1 = subject(
    `/**
 * @param {string} a __very__ important!
 * @param {string} b _less_ important...
 */`,
  );

  expect(result1).toMatchSnapshot();
});

test("`#` in text", () => {
  const result1 = subject(
    `/**
* JS: \`console.log("foo # bar");\`
*
* Some # text
*
* More text
*/`,
  );

  expect(result1).toMatchSnapshot();
});

test("empty lines", () => {
  const result1 = subject(
    `/**
* Foo
*
*
*
*
*
* Bar
*
*
*
*
* @param a Baz
*/`,
  );

  expect(result1).toMatchSnapshot();
});

test("Non-english description with dot", () => {
  const result = subject(
    `/**

* Wir brauchen hier eine effizientere Lösung. Die generierten Dateien sind zu groß

*
* Wir brauchen hier eine effizientere Lösung. Die generierten Dateien sind zu 3434

*


* @description Wir brauchen hier eine effizientere Lösung. Die generierten Dateien sind zu groß


* @param a ssss

*/

/**
 * Unicode est un standard informatique qui permet des échanges de textes dans différentes langues, à un niveau mondial. Il est développé par le Consortium Unicode, qui vise au codage de texte écrit en donnant à tout caractère de n'importe quel système d'écriture un nom et un identifiant numérique, et ce de manière unifiée, quels que soient la plate-forme informatique ou le logiciel utilisé
 *
 * @see https://fr.wikipedia.org/wiki/Unicode
 */

/**
 * Юнико́д[1] (чаще всего) или Унико́д[2] (англ. Unicode) — стандарт кодирования символов, включающий в себя знаки почти всех письменных языков мира[3]. В настоящее время стандарт является преобладающим в Интернете
 *
 * @see https://ru.wikipedia.org/wiki/%D0%AE%D0%BD%D0%B8%D0%BA%D0%BE%D0%B4
 */

/**
 * Unicode（ユニコード）は、符号化文字集合や文字符号化方式などを定めた、文字コードの業界規格。文字集合（文字セット）が単一の大規模文字セットであること（「Uni」という名はそれに由来する）などが特徴である
 *
 * @see https://ja.wikipedia.org/wiki/Unicode
 */
`,
    {
      jsdocDescriptionWithDot: true,
    },
  );

  expect(result).toMatchSnapshot();
});

test("New Lines with star", () => {
  const result1 = subject(
    `/**
 * Simplifies the token stream to ease the matching with the expected token stream.
 *
 * * Strings are kept as-is
 * * In arrays each value is transformed individually
 * * Values that are empty (empty arrays or strings only containing whitespace)
 *
 * @param {TokenStream} tokenStream
 * @returns {SimplifiedTokenStream}
 */
`,
  );

  expect(result1).toMatchSnapshot();

  const result2 = subject(
    `/**
    * Some comment text.
    *
    * **Warning:** I am a warning.
    */
`,
  );

  expect(result2).toMatchSnapshot();
});

test("# in block code", () => {
  const result1 = subject(
    `/**
* \`\`\`py
* # This program adds two numbers
*
* num1 = 1.5
* num2 = 6.3
*
* # Add two numbers
* sum = num1 + num2
*
* # Display the sum
* print('The sum of {0} and {1} is {2}'.format(num1, num2, sum))
* \`\`\`
*/
`,
  );

  expect(result1).toMatchSnapshot();
});

test("Long words", () => {
  const result2 = subject(
    `
/**
 * 1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567
 */
`,
    {
      jsdocSingleLineComment: false,
    },
  );

  expect(result2).toMatchSnapshot();
});

test("Markdown Table", () => {
  const result1 = subject(
    `
/**
 * description 
 * | A| B |C |
 * | - | - | - |
 * |C | V | B |
 * |1|2|3|
 * 
 * description 
 * 
 * 
 * | A| B |C |
 * |C | V | B |
 * |1|2|3|
 * end
 */
`,
  );

  expect(result1).toMatchSnapshot();

  const result2 = subject(
    `
/**
 * | A| B |C |
 * | - | - | - |
 * |C | V | B |
 * |1|2|3|
 */
`,
  );

  expect(result2).toMatchSnapshot();

  const result3 = subject(
    `
/**
 * @param {string} a description
 * | A| B |C |
 * | - | - | - |
 * |C | V | B |
 * |1|2|3|
 */
`,
  );

  expect(result3).toMatchSnapshot();

  const result4 = subject(
    `
/**
 * description
 * \`\`\`
 * fenced code
 * | A| B |C |
 * | - | - | - |
 * |C | V | B |
 * |1|2|3|
 * \`\`\`
 *
 * \`\`\`
 * Second fenced table-like
 * | A
 * | B
 * \`\`\`
 */
    `,
  );

  expect(result4).toMatchSnapshot();

  const result5 = subject(
    `
/**
 * description
 *
 * indented code
 *
 *     | A| B |C |
 *     | - | - | - |
 *     |C | V | B |
 *     |1|2|3|
 */
`,
  );

  expect(result5).toMatchSnapshot();
});

test("Jsdoc link in description", () => {
  const result1 = subject(`
/**
 * Calculate the 
 * {@link https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement difference}
 * between two sets.
 * @param second
 * @param first
 */
 export function difference<T>(first: Set<T>, second: Set<T>): Set<T>


 /**
 * Calculate the 
 * {@link https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement difference}
 * {@link https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement difference}
 * between two sets.
 */

  /**
 * Calculate the 
 * {@link https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement difference}
 * between
 * {@link https://en.wikipedia.org/wiki/Complement}
 * between two sets.
 */`);

  expect(result1).toMatchSnapshot();
});

test("Markdown link", () => {
  const result1 = subject(`
/**
 @param {string} [dir] [Next.js](https://nextjs.org) project directory path.
 */
`);

  expect(result1).toMatchSnapshot();
});

test("Jsx tsx css ", () => {
  const result1 = subject(`
 /**
  * \`\`\`js
  * let   a
  * \`\`\`
  * 
  * \`\`\`jsx
  * let   a
  * \`\`\`
  * 
  * \`\`\`css
  * .body {color:red;
  * }
  * \`\`\`
  * 
  * \`\`\`html
  * <div class="body"  >   </   div>
  * \`\`\`
  */
`);

  expect(result1).toMatchSnapshot();
});

test("Not Capitalizing", () => {
  const comment = `/**

  * simplifies the token stream to ease the matching with the expected token stream.
 
  * Simplifies the token stream to ease the matching with the expected token stream.
  *
  * * Strings are kept as-is
  * * in arrays each value is transformed individually
  * * Values that are empty (empty arrays or strings only containing whitespace)
  *
  * @param {TokenStream} tokenStream Description
  * @returns {SimplifiedTokenStream} description
  */
 `;
  const result1 = subject(comment, {
    jsdocCapitalizeDescription: false,
  });

  expect(result1).toMatchSnapshot();

  const result2 = subject(comment, {
    jsdocCapitalizeDescription: true,
  });

  expect(result2).toMatchSnapshot();
});

test("Code in description", () => {
  const comment = `
  /**
   * Inspired from react-native View
   *
   * \`\`\`js
   * import { View } from "react-native";
   *
   * 
   * 
   * function MyComponent() {
   *  return (
   *   <View style={{ alignItems: 'center' }}>
   *    <View variant="a" href="/" onPress={()=>{
   * history.push('/')
   * }} style={{ width:300,height:50 }} >
   *    <Text>Hello World</Text>
   *   </View>
   *  </View>
   * );
   * }
   * \`\`\`
   */
 `;

  const indented = `
/**
 * description
 *
 *     an indented code block
 *     of a few lines.
 */
`;

  const fenced = `
/**
 * description
 *
 * \`\`\`
 * A fenced code block
 * spanning a few lines.
 * \`\`\`
 */
`;

  const result1 = subject(comment);

  expect(result1).toMatchSnapshot();

  const result2 = subject(indented);

  expect(result2).toMatchSnapshot();

  const result3 = subject(indented, { jsdocPreferCodeFences: true });

  expect(result3).toMatchSnapshot();

  const result4 = subject(fenced);

  expect(result4).toMatchSnapshot();

  const result5 = subject(fenced, { jsdocPreferCodeFences: true });

  expect(result5).toMatchSnapshot();
});

const prettier = require("prettier");

function subject(code, options = {}) {
  try {
    return prettier.format(code, {
      plugins: ["."],
      parser: "babel-ts",
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
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
   *     {source code}
   *     ----
   *     {expected token stream}
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
 *     2.   Choose the rendered component who should collect the press events. On that
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

  const result3 = subject(`
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
`);
  expect(result3).toMatchSnapshot();
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
      printWidth: 80,
    },
  );

  expect(subject(subject(result1))).toEqual(result1);

  expect(result1).toMatchSnapshot();
});

/**
 * If this is a vertical ScrollView scrolls to the bottom.
 * If this is a horizontal ScrollView scrolls to the right.
 *
 * Use `scrollToEnd({ animated: true })` for smooth animated scrolling,
 * `scrollToEnd({ animated: false })` for immediate scrolling.
 * If no options are passed, `animated` defaults to true.
 */

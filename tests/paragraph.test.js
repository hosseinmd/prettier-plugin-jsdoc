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
   * during an animation. This is a very useful default that happens to satisfy
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
});

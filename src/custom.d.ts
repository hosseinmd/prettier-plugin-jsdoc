declare namespace jest {
  interface Matchers<R> {
    toMatchSpecificSnapshot(filename: string): R;
  }
}

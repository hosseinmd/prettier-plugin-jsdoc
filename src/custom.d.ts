declare namespace jest {
  interface Matchers<R, T> {
    toMatchSpecificSnapshot(filename: string): R;
  }
}

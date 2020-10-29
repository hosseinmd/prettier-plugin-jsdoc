module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "prettier",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
};

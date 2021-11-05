module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: "next",
  },
  parser: "@typescript-eslint/parser",
  extends: ["prettier", "eslint:recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off",
    "no-redeclare": "off",
    "no-const-assign": "off",
  },
};

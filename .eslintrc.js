module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["prettier", "eslint:recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off",
  },
};

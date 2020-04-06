/* eslint-disable no-undef */
const prettier = require("prettier");

function subject(code, options = {}) {
  try {
    return prettier.format(code, {
      parser: "jsdoc-parser",
      plugins: ["."],
      jsdocSpaces: 1,
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
}

test("JS code should be formatted as usuall", () => {
  const result = subject(`
  /**
 @typedef {
    {
        "userId": string,
        "title": string,
        "profileImageLink": string,
        "identityStatus": "None",
        "isBusinessUser": boolean,
        "isResellerUser": boolean,
        "isSubUser": boolean,
        "shareCode": number,
        "referredBy": string,
        "businessName": string,
        "businessUserId": string,
        "nationalCode": string,
        "state": string,
        "city": string,
        "address": string,
        "phoneNumber": string
      }
     } User
     */
  export let User

  /**
     @typedef {
      {
        "domainId": 0,
        persianName: string,
        "englishName": string, // comment
        "resellerUserId": string,
        "isActive": true,
        "logoFileUniqueId": string,
        "logoFileName": string,
        "logoFileUrl": string,
        "domainPersianName": string,
        "domainEnglishName": string,
        "resellerUserDisplayName": string,
        "about": string
      }
     } SubDomain
     */

    /**
     @typedef {
      () => a.b
     } SubDomain
     */
    `);

  expect(result).toMatchSnapshot();
});

test("hoisted object", () => {
  const result = subject(`
  /**
 @typedef {
    {
        "userId": {
        title: string,
        "profileImageLink": *,
        "identityStatus": "None",
        "isBusinessUser": "isResellerUser"|"isBoolean"|  "isSubUser" |    "isNot",
        "shareCode": number,
        "referredBy": any,
        },
        id:number
      }
     } User
     */
 
    `);

  expect(result).toMatchSnapshot();
});

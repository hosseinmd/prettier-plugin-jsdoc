import { format, Options } from "prettier";

function convertToModernType(oldType: string): string {
  return withoutStrings(oldType, (type) => {
    // JSDoc supports generics of the form `Foo.<Arg1, Arg2>`
    type = type.replace(/\.</g, "<");

    type = type.replace(/\*/g, " any ");

    // convert `Array<Foo>` to `Foo[]`
    type = type.replace(
      /(?:^|[^$\w\xA0-\uFFFF])Array\s*<((?:[^<>=]|=>|=(?!>)|<(?:[^<>=]|=>|=(?!>))+>)+)>/g,
      "($1)[]",
    );

    return type;
  });
}

/**
 * Given a valid TS type expression, this will replace all string literals in
 * the type with unique identifiers. The modified type expression will be passed
 * to the given map function. The unique identifiers in the output if the map
 * function will then be replaced with the original string literals.
 *
 * This allows the map function to do type transformations without worrying
 * about string literals.
 *
 * @param type
 * @param mapFn
 */
function withoutStrings(type: string, mapFn: (type: string) => string): string {
  const strings: string[] = [];
  let modifiedType = type.replace(
    /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/g,
    (m) => {
      strings.push(m);
      // the pattern of the unique identifiers
      // let's hope that nobody uses an identifier like this in real code
      return `String$${strings.length - 1}$`;
    },
  );

  if (modifiedType.includes("`")) {
    // We are current unable to correct handle template literal types.
    return type;
  }

  modifiedType = mapFn(modifiedType);

  return modifiedType.replace(/String\$(\d+)\$/g, (_, index) => strings[index]);
}

function formatType(type: string, options?: Options): string {
  try {
    const TYPE_START = "type name = ";

    let pretty = format(`${TYPE_START}${type}`, {
      ...options,
      parser: "typescript",
    });
    pretty = pretty.slice(TYPE_START.length);

    pretty = pretty.replace(/[;\n]*$/g, "");

    return pretty;
  } catch (error) {
    // console.log("jsdoc-parser", error);
    return type;
  }
}

function addStarsToTheBeginningOfTheLines(comment: string): string {
  if (numberOfAStringInString(comment.trim(), "\n") === 0) {
    return `* ${comment.trim()} `;
  }

  return `*${comment.replace(/((?!\n$)\n)/g, "\n * ")}\n `;
}

function numberOfAStringInString(string: string, search: string | RegExp) {
  return (string.match(new RegExp(search, "g")) || []).length;
}

// capitalize if needed
function capitalizer(str: string): string {
  if (!str) {
    return str;
  }

  if (str.match(new RegExp("^(http|https)://", "i"))) {
    return str;
  }

  if (str.startsWith("- ")) {
    return str.slice(0, 2) + capitalizer(str.slice(2));
  }

  return str[0].toUpperCase() + str.slice(1);
}

export {
  convertToModernType,
  formatType,
  addStarsToTheBeginningOfTheLines,
  capitalizer,
};

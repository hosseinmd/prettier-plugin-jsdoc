import { format, Options } from "prettier";

function convertToModernType(oldType: string): string {
  return withoutStrings(oldType, (type) => {
    type = type.trim();

    // JSDoc supports generics of the form `Foo.<Arg1, Arg2>`
    type = type.replace(/\.</g, "<");

    // JSDoc supports `*` to match any type
    type = type.replace(/\*/g, " any ");

    // JSDoc supports `?` (prefix or suffix) to make a type nullable
    // This is only a limited approximation because the full solution requires
    // a full TS parser.
    type = type
      .replace(/^\?\s*(\w+)$/, "$1 | null")
      .replace(/^(\w+)\s*\?$/, "$1 | null");

    // convert `Array<Foo>` to `Foo[]`
    let changed = true;
    while (changed) {
      changed = false;
      type = type.replace(
        /(^|[^$\w\xA0-\uFFFF])Array\s*<((?:[^<>=]|=>|=(?!>)|<(?:[^<>=]|=>|=(?!>))+>)+)>/g,
        (_, prefix, inner) => {
          changed = true;
          return `${prefix}(${inner})[]`;
        },
      );
    }

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
    // copied from Prism's C-like language that is used to tokenize JS strings
    // https://github.com/PrismJS/prism/blob/266cc7002e54dae674817ab06a02c2c15ed64a6f/components/prism-clike.js#L15
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

    let pretty = type;

    // Rest parameter types start with "...". This is supported by TS and JSDoc
    // but it's implemented in a weird way in TS. TS will only acknowledge the
    // "..." if the function parameter is a rest parameter. In this case, TS
    // will interpret `...T` as `T[]`. But we can't just convert "..." to arrays
    // because of @callback types. In @callback types `...T` and `T[]` are not
    // equivalent, so we have to support "..." as is.
    //
    // This formatting itself is rather simple. If `...T` is detected, it will
    // be replaced with `T[]` and formatted. At the end, the outer array will
    // be removed and "..." will be added again.
    //
    // As a consequence, union types will get an additional pair of parentheses
    // (e.g. `...A|B` -> `...(A|B)`). This is technically unnecessary but it
    // makes the operator precedence very clear.
    //
    // https://www.typescriptlang.org/docs/handbook/functions.html#rest-parameters
    let rest = false;
    if (pretty.startsWith("...")) {
      rest = true;
      pretty = `(${pretty.slice(3)})[]`;
    }

    pretty = format(`${TYPE_START}${pretty}`, {
      ...options,
      parser: "typescript",
    });
    pretty = pretty.slice(TYPE_START.length);
    pretty = pretty.replace(/[;\n]*$/g, "");

    if (rest) {
      pretty = "..." + pretty.replace(/\[\s*\]$/, "");
    }

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

  return `*${comment.replace(/(\n(?!$))/g, "\n * ")}\n `;
}

function numberOfAStringInString(string: string, search: string | RegExp) {
  return (string.match(new RegExp(search, "g")) || []).length;
}

// capitalize if needed
function capitalizer(str: string): string {
  if (!str) {
    return str;
  }

  if (str.match(/^https?:\/\//i)) {
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

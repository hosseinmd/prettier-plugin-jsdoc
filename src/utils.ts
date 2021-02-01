import { format, Options } from "prettier";

function convertToModernArray(type: string): string {
  if (!type) {
    return type;
  }

  const maxWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<(^[<>]+)>)/g;
  const minWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^.]+)>)/g;
  type = type.replace(".<", "<");

  function replaceArray(value: string): string {
    let regular = maxWrapper;
    let result = regular.exec(value);

    if (!result) {
      regular = minWrapper;
      result = regular.exec(value);
    }

    if (!result) {
      return value;
    }
    const typeName = result[2];

    value = value.replace(regular, `(${typeName})[]`);
    return replaceArray(value);
  }

  return replaceArray(type);
}

function formatType(type: string, options?: Options): string {
  try {
    let pretty = type.replace("*", "any");
    const TYPE_START = "type name = ";

    pretty = format(`${TYPE_START}${pretty}`, {
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
  convertToModernArray,
  formatType,
  addStarsToTheBeginningOfTheLines,
  capitalizer,
};

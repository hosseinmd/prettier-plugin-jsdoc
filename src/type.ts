//@ts-check
import { format, Options } from "prettier";

function convertToModernArray(type: string) {
  if (!type) {
    return type;
  }

  const maxWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^<>]+)>)/g;
  const minWrapper = /^(?!<>\]\[\{\}:;,\s)(Array<([^.]+)>)/g;
  type = type.replace(".<", "<");

  function replaceArray(value: string): any {
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

    value = value.replace(regular, `${typeName}[]`);
    return replaceArray(value);
  }

  return replaceArray(type);
}

function formatType(type: string, options?: Options) {
  try {
    let pretty = type.replace("*", "any");
    const TYPE_START = "type name = ";

    pretty = format(`${TYPE_START}${pretty}`, {
      ...options,
      parser: "typescript",
    });
    pretty = pretty.slice(TYPE_START.length);

    pretty = pretty.replace(/[(;\n);\n]*$/g, "");

    return pretty;
  } catch (error) {
    console.log("jsdoc-parser", error);
    return type;
  }
}

export { convertToModernArray, formatType };

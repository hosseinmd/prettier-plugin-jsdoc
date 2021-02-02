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

function trimEmptyLines(string: string): string {
  return string.replace(/^[\r\n]+|[\r\n]+$/g, "");
}
function trimTrailingSpaces(string: string): string {
  return string
    .split(/\n/g)
    .map((line) => line.trimEnd())
    .join("\n");
}
function trimIndentation(string: string): string {
  const lines = string.split(/\n/g);

  const enum IndentationKind {
    SPACES,
    TABS,
    UNKNOWN,
  }

  let kind = IndentationKind.UNKNOWN;
  let min = Infinity;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line) {
      const first = line[0];

      if (first === " ") {
        if (kind === IndentationKind.TABS) {
          break;
        } else {
          kind = IndentationKind.SPACES;
        }
      } else if (first === "\t") {
        if (kind === IndentationKind.SPACES) {
          break;
        } else {
          kind = IndentationKind.TABS;
        }
      } else {
        min = 0;
        break;
      }

      let lineIndent = 1;
      for (let j = 1; j < line.length; j++) {
        if (line[j] === first) {
          lineIndent++;
        } else {
          break;
        }
      }

      min = Math.min(min, lineIndent);
    }
  }

  if (min === 0 || min === Infinity) {
    return lines.join("\n");
  } else {
    return lines.map((line) => line.slice(min)).join("\n");
  }
}

function countLines(string: string): number {
  return string.split(/\n/g).length;
}
function getFirstLine(string: string): string {
  const lines = string.split(/\n/g);
  return lines[0];
}
function getLastLine(string: string): string {
  const lines = string.split(/\n/g);
  return lines[lines.length - 1];
}

function prefixLinesWith(
  string: string,
  prefix: string,
  ignoreEmpty?: boolean,
): string {
  return string
    .split(/\n/g)
    .map((line) => (ignoreEmpty && line.length === 0 ? "" : prefix + line))
    .join("\n");
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

function tryFormat(source: string, options?: Options): string | undefined {
  try {
    return format(source, options);
  } catch (error) {
    return undefined;
  }
}

export {
  convertToModernType,
  formatType,
  capitalizer,
  trimEmptyLines,
  trimIndentation,
  trimTrailingSpaces,
  countLines,
  getFirstLine,
  getLastLine,
  prefixLinesWith,
  tryFormat,
};

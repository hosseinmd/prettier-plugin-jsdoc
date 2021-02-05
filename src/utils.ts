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

/**
 * Detects the line ends of the given text.
 *
 * If multiple line ends are used, the most common one will be returned.
 *
 * If the given text is a single line, "lf" will be returned.
 *
 * @param text
 */
function detectEndOfLine(text: string): "cr" | "crlf" | "lf" {
  const counter = {
    "\r": 0,
    "\r\n": 0,
    "\n": 0,
  };

  const lineEndPattern = /\r\n?|\n/g;
  let m;
  while ((m = lineEndPattern.exec(text))) {
    counter[m[0] as keyof typeof counter]++;
  }

  const cr = counter["\r"];
  const crlf = counter["\r\n"];
  const lf = counter["\n"];
  const max = Math.max(cr, crlf, lf);

  if (lf === max) {
    return "lf";
  } else if (crlf === max) {
    return "crlf";
  } else {
    return "cr";
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

  const skipFirst = !/^[ \t]/.test(lines[0]);
  for (let i = skipFirst ? 1 : 0; i < lines.length; i++) {
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
    return lines
      .map((line, i) => (i === 0 && skipFirst ? line : line.slice(min)))
      .join("\n");
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

export {
  convertToModernType,
  formatType,
  capitalizer,
  detectEndOfLine,
  trimEmptyLines,
  trimTrailingSpaces,
  trimIndentation,
  countLines,
  getFirstLine,
  getLastLine,
  prefixLinesWith,
};

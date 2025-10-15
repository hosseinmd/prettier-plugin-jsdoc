import { ParserOptions } from "prettier";

export interface JsdocOptions {
  jsdocSpaces: number;
  jsdocPrintWidth?: number;
  jsdocDescriptionWithDot: boolean;
  jsdocDescriptionTag: boolean;
  jsdocVerticalAlignment: boolean;
  jsdocKeepUnParseAbleExampleIndent: boolean;
  /**
   * @deprecated use jsdocCommentLineStrategy instead
   * @default true
   */
  jsdocSingleLineComment: boolean;
  /** @default "singleLine" */
  jsdocCommentLineStrategy: "singleLine" | "multiline" | "keep";
  jsdocSeparateReturnsFromParam: boolean;
  jsdocSeparateTagGroups: boolean;
  jsdocAddDefaultToDescription: boolean;
  jsdocCapitalizeDescription: boolean;
  jsdocPreferCodeFences: boolean;
  tsdoc: boolean;
  jsdocLineWrappingStyle: "greedy";
  jsdocTagsOrder?: Record<string, number>;
  jsdocNamedImportPadding: boolean;
}

export interface AllOptions extends ParserOptions, JsdocOptions {}

type LocationDetails = { line: number; column: number };
type Location = { start: LocationDetails; end: LocationDetails };

export type PrettierComment = {
  type: "CommentBlock" | "Block";
  value: string;
  start: number;
  end: number;
  loc: Location;
};

export type Token = {
  type:
    | "CommentBlock"
    | "Block"
    | {
        label: string; // "function" | "name";
        keyword?: string;
        beforeExpr: boolean;
        startsExpr: boolean;
        rightAssociative: boolean;
        isLoop: boolean;
        isAssign: boolean;
        prefix: boolean;
        postfix: boolean;
        binop: null;
      };
  value: string;
  start: number;
  end: number;
  loc: Location;
};

export type AST = {
  start: number;
  end: number;
  loc: Location;
  errors: [];
  program: {
    type: "Program";
    start: number;
    end: number;
    loc: [];
    sourceType: "module";
    interpreter: null;
    body: [];
    directives: [];
  };
  comments: PrettierComment[];
  tokens: Token[];
};

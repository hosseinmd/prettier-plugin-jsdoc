import { Options } from "prettier";

export type JsdocOptions = {
  jsdocSpaces: number;
  jsdocDescriptionWithDot: boolean;
  jsdocDescriptionTag: boolean;
  jsdocVerticalAlignment: boolean;
  jsdocKeepUnParseAbleExampleIndent: boolean;
  jsdocTagsOrder: string[];
  jsdocParser: boolean;
} & Options;

type LocationDetails = { line: number; column: number };
type Location = { start: LocationDetails; end: LocationDetails };

export type PrettierComment = {
  type: "CommentBlock";
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
};

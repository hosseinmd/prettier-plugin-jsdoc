//@ts-check
import {
  ABSTRACT,
  CATEGORY,
  CLASS,
  CONSTANT,
  DEFAULT,
  DESCRIPTION,
  EXAMPLE,
  EXTENDS,
  EXTERNAL,
  FILE,
  FIRES,
  FUNCTION,
  MEMBER,
  PARAM,
  PROPERTY,
  RETURNS,
  SINCE,
  THROWS,
  TODO,
  TYPE,
  TYPEDEF,
  YIELDS,
  DEPRECATED,
} from "./tags";

const TAGS_SYNONYMS = {
  // One TAG TYPE can have different titles called SYNONYMS.  We want
  // to avoid different titles in the same tag so here is map with
  // synonyms as keys and tag type as value that we want to have in
  // final jsDoc.
  arg: PARAM,
  argument: PARAM,
  const: CONSTANT,
  constructor: CLASS,
  defaultvalue: DEFAULT,
  desc: DESCRIPTION,
  emits: FIRES,
  examples: EXAMPLE,
  exception: THROWS,
  fileoverview: FILE,
  func: FUNCTION,
  host: EXTERNAL,
  method: FUNCTION,
  overview: FILE,
  params: PARAM,
  prop: PROPERTY,
  return: RETURNS,
  var: MEMBER,
  virtual: ABSTRACT,
  yield: YIELDS,
};

const TAGS_NAMELESS = [
  DESCRIPTION,
  EXAMPLE,
  EXTENDS,
  RETURNS,
  THROWS,
  TODO,
  YIELDS,
  DEPRECATED,
];
const TAGS_DESCRIPTION_NEEDED = [CATEGORY, DESCRIPTION, EXAMPLE, SINCE, TODO];
const TAGS_NEED_FORMAT_DESCRIPTION = [
  DESCRIPTION,
  PARAM,
  PROPERTY,
  RETURNS,
  THROWS,
  TODO,
  TYPE,
  TYPEDEF,
  YIELDS,
  DEPRECATED,
];
const TAGS_TYPE_NEEDED = [
  EXTENDS,
  PARAM,
  PROPERTY,
  RETURNS,
  THROWS,
  TYPE,
  TYPEDEF,
  YIELDS,
];

const TAGS_VERTICALLY_ALIGN_ABLE = [
  EXTENDS,
  PARAM,
  PROPERTY,
  RETURNS,
  THROWS,
  TYPE,
  TYPEDEF,
  YIELDS,
];

export {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_NEED_FORMAT_DESCRIPTION,
  TAGS_NAMELESS,
  TAGS_SYNONYMS,
  TAGS_TYPE_NEEDED,
  TAGS_VERTICALLY_ALIGN_ABLE,
};

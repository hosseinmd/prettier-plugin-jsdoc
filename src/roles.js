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
  TYPE,
  TYPEDEF,
  TODO,
  YIELDS,
} from "./tags";

const TAGS_SYNONYMS = {
  // One TAG TYPE can have different titles called SYNONYMS.  We want
  // to avoid different titles in the same tag so here is map with
  // synonyms as keys and tag type as value that we want to have in
  // final jsDoc.
  virtual: ABSTRACT,
  constructor: CLASS,
  const: CONSTANT,
  defaultvalue: DEFAULT,
  desc: DESCRIPTION,
  host: EXTERNAL,
  fileoverview: FILE,
  overview: FILE,
  emits: FIRES,
  func: FUNCTION,
  method: FUNCTION,
  var: MEMBER,
  arg: PARAM,
  argument: PARAM,
  prop: PROPERTY,
  return: RETURNS,
  exception: THROWS,
  yield: YIELDS,
  examples: EXAMPLE,
  params: PARAM,
};

const TAGS_NAMELESS = [
  YIELDS,
  RETURNS,
  THROWS,
  EXAMPLE,
  EXTENDS,
  DESCRIPTION,
  TODO,
];
const TAGS_DESCRIPTION_NEEDED = [DESCRIPTION, EXAMPLE, TODO, SINCE, CATEGORY];
const TAGS_HAVE_DESCRIPTION = [
  DESCRIPTION,
  PARAM,
  PROPERTY,
  RETURNS,
  YIELDS,
  THROWS,
  TODO,
  TYPE,
  TYPEDEF,
];
const TAGS_TYPE_NEEDED = [
  EXTENDS,
  RETURNS,
  YIELDS,
  THROWS,
  PARAM,
  PROPERTY,
  TYPE,
  TYPEDEF,
];

const TAGS_VERTICALLY_ALIGN_ABLE = [
  PARAM,
  PROPERTY,
  RETURNS,
  EXTENDS,
  THROWS,
  YIELDS,
  TYPE,
  TYPEDEF,
];

export {
  TAGS_SYNONYMS,
  TAGS_DESCRIPTION_NEEDED,
  TAGS_HAVE_DESCRIPTION,
  TAGS_NAMELESS,
  TAGS_TYPE_NEEDED,
  TAGS_VERTICALLY_ALIGN_ABLE,
};

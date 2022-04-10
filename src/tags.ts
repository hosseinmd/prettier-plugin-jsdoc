import { Spec } from "comment-parser";

const ABSTRACT = "abstract";
const ASYNC = "async";
const AUGMENTS = "augments";
const AUTHOR = "author";
const BORROWS = "borrows";
const CALLBACK = "callback";
const CATEGORY = "category";
const CLASS = "class";
const CONSTANT = "constant";
const DEFAULT = "default";
const DEFAULT_VALUE = "defaultValue";
/** official documentation makes `@defaultvalue` all lowercase */
const DEFAULT_VALUE_LOWERCASE = "defaultvalue";
const DEPRECATED = "deprecated";
const DESCRIPTION = "description";
const EXAMPLE = "example";
const EXTENDS = "extends";
const EXTERNAL = "external";
const FILE = "file";
const FIRES = "fires";
const FLOW = "flow";
const FUNCTION = "function";
const IGNORE = "ignore";
const LICENSE = "license";
const MEMBER = "member";
const MEMBEROF = "memberof";
const MODULE = "module";
const NAMESPACE = "namespace";
const OVERRIDE = "override";
const PARAM = "param";
const PRIVATE = "private";
const PRIVATE_REMARKS = "privateRemarks";
const PROPERTY = "property";
const PROVIDES_MODULE = "providesModule";
const REMARKS = "remarks";
const RETURNS = "returns";
const SEE = "see";
const SINCE = "since";
const TEMPLATE = "template";
const THROWS = "throws";
const TODO = "todo";
const TYPE = "type";
const TYPE_PARAM = "typeParam";
const TYPEDEF = "typedef";
const VERSION = "version";
const YIELDS = "yields";

const SPACE_TAG_DATA: Spec = {
  tag: "this_is_for_space",
  name: "",
  optional: false,
  type: "",
  description: "",
  source: [],
  problems: [],
};

export {
  ABSTRACT,
  ASYNC,
  AUGMENTS,
  AUTHOR,
  BORROWS,
  CALLBACK,
  CATEGORY,
  CLASS,
  CONSTANT,
  DEFAULT,
  DEFAULT_VALUE,
  DEFAULT_VALUE_LOWERCASE,
  DEPRECATED,
  DESCRIPTION,
  EXAMPLE,
  EXTENDS,
  EXTERNAL,
  FILE,
  FIRES,
  FLOW,
  FUNCTION,
  IGNORE,
  LICENSE,
  MEMBER,
  MEMBEROF,
  MODULE,
  NAMESPACE,
  OVERRIDE,
  PARAM,
  PRIVATE_REMARKS,
  PRIVATE,
  PROPERTY,
  PROVIDES_MODULE,
  REMARKS,
  RETURNS,
  SEE,
  SINCE,
  TEMPLATE,
  THROWS,
  TODO,
  TYPE,
  TYPE_PARAM,
  TYPEDEF,
  VERSION,
  YIELDS,
  SPACE_TAG_DATA,
};

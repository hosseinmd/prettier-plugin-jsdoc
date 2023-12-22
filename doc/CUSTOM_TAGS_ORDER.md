# jsdocTagsOrder

Use this param for customizing tags order. To change tags order, Change the weight of them, for example the `default` tag has 22 weight for put that below of `returns` (42) we could change weight of it to 42.1

```json
{
  "jsdocTagsOrder": "{\"default\":42.1}"
}
```

jsdocTagsOrder accepting json string

### plugin builtin order

```
  remarks: 1,
  privateRemarks: 2,
  providesModule: 3,
  module: 4,
  license: 5,
  flow: 6,
  async: 7,
  private: 8,
  ignore: 9,
  memberof: 10,
  version: 11,
  file: 12,
  author: 13,
  deprecated: 14,
  since: 15,
  category: 16,
  description: 17,
  example: 18,
  abstract: 19,
  augments: 20,
  constant: 21,
  default: 22,
  defaultValue: 23,
  external: 24,
  overload: 25,
  fires: 26,
  template: 27,
  typeParam: 28,
  function: 29,
  namespace: 30,
  borrows: 31,
  class: 32,
  extends: 33,
  member: 34,
  typedef: 35,
  type: 36,
  satisfies: 37,
  property: 38,
  callback: 39,
  param: 40,
  yields: 41,
  returns: 42,
  throws: 43,

  other: 44, // any other tags which is not listed here

  see: 45,
  todo: 46,

```

### example

```json
{
  "jsdocTagsOrder": "{\"param\":28.1,  \"return\":28.2, \"example\":70}"
}
```

const assert = require("assert");
const {
  and,
  isCall,
  toCallee,
  withArgsLength,
  importOf,
  idsExcludingImportAndMember
} = require("./predicates");
const tree = require("./tree");
const editor = require("./editor");

const parse = tree.parse(tree.moduleJsxSpreadOptions);
function convertLodashGetToLodashFP(contents) {
  const isGet = and(isCall, toCallee("get"));
  const ast = parse(contents);
  const allGets = tree.grep(isGet, ast);
  const allRelevantGetIds = tree.grep(idsExcludingImportAndMember("get"), ast);
  const importNodes = tree.grep(importOf("lodash/get"), ast);
  if (importNodes.length !== 1) {
    throw new Error("multiple imports of get");
  }

  const get2s = allGets.filter(withArgsLength(2));
  const get3s = allGets.filter(withArgsLength(3));
  if (allGets.length !== get2s.length + get3s.length) {
    throw new Error("expected to find only get calls of length 2 and 3");
  }
  if (allRelevantGetIds.length !== allGets.length) {
    throw new Error("other uses of get than calls and import statement");
  }
  const get2Replacements = get2s.map(tree.reorderArgs([1, 0]));
  const get3Replacements = get3s.map(tree.reorderArgs([2, 1, 0]));
  const get3Renames = get3s.map(tree.renameCall("getOr"));

  const newImportText = [
    get2s.length > 0 ? "get" : null,
    get3s.length > 0 ? "getOr" : null
  ]
    .filter(Boolean)
    .map(x => `import ${x} from 'lodash/fp/${x}';`)
    .join("\n");
  const importTransformations = tree.rewriteNodePath(
    newImportText,
    importNodes[0]
  );
  const replacements = [
    ...get2Replacements,
    ...get3Replacements,
    ...get3Renames,
    importTransformations
  ];
  return editor.performTransformations(replacements, contents);
}

module.exports = {
  convertLodashGetToLodashFP
};

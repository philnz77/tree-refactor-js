const assert = require("assert");
const { and, isCall, toCallee, withArgsLength } = require("./predicates");
const tree = require("./tree");
const editor = require("./editor");

const parse = tree.parse(tree.moduleJsxSpreadOptions);
function convertLodashGetToLodashFP(contents) {
  const isGet = and(isCall, toCallee("get"));

  const allGets = tree.grep(isGet, parse(contents));
  const get2s = allGets.filter(withArgsLength(2));
  const get3s = allGets.filter(withArgsLength(3));
  if (allGets.length !== get2s.length + get3s.length) {
    throw new Error("expected to find only get calls of length 2 and 3");
  }
  const get2Replacements = get2s.map(tree.reorderArgs([1, 0]));
  const get3Replacements = get3s.map(tree.reorderArgs([2, 1, 0]));
  const get3Renames = get3s.map(tree.renameCall("getOr"));
  const replacements = [
    ...get2Replacements,
    ...get3Replacements,
    ...get3Renames
  ];
  return editor.performTransformations(replacements, contents);
}

module.exports = {
  convertLodashGetToLodashFP
};

var _ = require("lodash/fp");

const and = (...predicates) => path =>
  _.every(predicate => predicate(path), _.flatten(predicates));
const not = predicate => path => !predicate(path);
const withType = type => path => path.node.type === type;
const isCall = withType("CallExpression");
const toCallee = name => path => {
  const callee = path.node.callee;
  return callee.type === "Identifier" && callee.name === name;
};
const withArgsLength = length => path => path.node.arguments.length === length;
const idOf = name =>
  and(withType("Identifier"), path => path.node.name === name);
const parentTypeOf = type => path => path.parent.type === type;
const parentIsImport = parentTypeOf("ImportDefaultSpecifier");
const parentIsMemberExpression = parentTypeOf("MemberExpression");
const importOf = importPath =>
  and(
    withType("ImportDeclaration"),
    path => path.node.source.value === importPath
  );
const idsExcludingImportAndMember = idName =>
  and(idOf(idName), not(parentIsImport), not(parentIsMemberExpression));
module.exports = {
  and,
  withType,
  isCall,
  toCallee,
  withArgsLength,
  idOf,
  parentTypeOf,
  parentIsImport,
  parentIsMemberExpression,
  importOf,
  idsExcludingImportAndMember
};

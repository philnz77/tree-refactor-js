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
const withImportDeclaration = withType("ImportDeclaration");
const importOf = importPath =>
  and(withImportDeclaration, path => path.node.source.value === importPath);
const idsExcludingImportAndMember = idName =>
  and(idOf(idName), not(parentIsImport), not(parentIsMemberExpression));

const specifierHasName = specifierId => specifier =>
  specifier.type === "ImportSpecifier" && specifier.local.name === specifierId;
const importWithSpecifier = specifierId =>
  and(withImportDeclaration, path =>
    _.some(specifierHasName(specifierId), path.node.specifiers)
  );

const withIdWithName = name => path => path.node.id.name === name;
const functionDeclarationOfName = name =>
  and(withType("FunctionDeclaration"), withIdWithName(name));

const arrowFunctionAssignToIdName = name =>
  and(
    withType("VariableDeclarator"),
    withIdWithName(name),
    path => _.get(["init", "type"], path.node) === "ArrowFunctionExpression"
  );

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
  idsExcludingImportAndMember,
  functionDeclarationOfName,
  arrowFunctionAssignToIdName,
  importWithSpecifier
};

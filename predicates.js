var _ = require("lodash/fp");

const and = (...predicates) => path =>
  _.every(predicate => predicate(path), _.flatten(predicates));
const not = predicate => path => !predicate(path);
const eq = _.curry((pathFromNode, expectedValue) => path =>
  _.get(pathFromNode, path.node) === expectedValue
);
const withType = type => eq("type", type);
const isCall = withType("CallExpression");
const toCallee = name => path => {
  const callee = path.node.callee;
  return callee.type === "Identifier" && callee.name === name;
};
const withArgsLength = length => eq("arguments.length", length);
const idOf = name => and(withType("Identifier"), eq("name", name));
const parentTypeOf = type => path => path.parent.type === type;
const parentIsImport = parentTypeOf("ImportDefaultSpecifier");
const parentIsMemberExpression = parentTypeOf("MemberExpression");
const isImportDeclaration = withType("ImportDeclaration");
const importOf = importPath =>
  and(isImportDeclaration, eq("source.value", importPath));
const idsExcludingImportAndMember = idName =>
  and(idOf(idName), not(parentIsImport), not(parentIsMemberExpression));

const specifierHasName = specifierId => specifier =>
  specifier.type === "ImportSpecifier" && specifier.local.name === specifierId;
const importWithSpecifier = specifierId =>
  and(isImportDeclaration, path =>
    _.some(specifierHasName(specifierId), path.node.specifiers)
  );

const functionDeclarationOfName = name =>
  and(withType("FunctionDeclaration"), eq("id.name", name));

const arrowFunctionAssignToIdName = name =>
  and(
    withType("VariableDeclarator"),
    eq("id.name", name),
    eq("init.type", "ArrowFunctionExpression")
  );

const isWildcardImportWithLocalName = localName =>
  and(isImportDeclaration, path => {
    const specifiers = path.node.specifiers;
    if (specifiers.length !== 1) {
      return false;
    }
    const specifier = specifiers[0];
    if (specifier.type !== "ImportNamespaceSpecifier") {
      return false;
    }
    return specifier.local.name === localName;
  });
module.exports = {
  and,
  eq,
  withType,
  isCall,
  toCallee,
  withArgsLength,
  idOf,
  parentTypeOf,
  parentIsImport,
  parentIsMemberExpression,
  isImportDeclaration,
  importOf,
  idsExcludingImportAndMember,
  functionDeclarationOfName,
  arrowFunctionAssignToIdName,
  importWithSpecifier,
  isWildcardImportWithLocalName
};

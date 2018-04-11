var _ = require("lodash/fp");

const tree = require("./tree");
const p = require("./predicates");

function findFunctionArgumentsFromIdentifier(idName, ast) {
  const declarationPaths = tree.grep(p.functionDeclarationOfName(idName), ast);
  if (declarationPaths.length > 1) {
    throw new Error("multiple function declarations");
  }
  if (declarationPaths.length === 1) {
    return { status: "ok", params: declarationPaths[0].node.params };
  }

  const assignmentPaths = tree.grep(p.arrowFunctionAssignToIdName(idName), ast);

  if (assignmentPaths.length > 1) {
    throw new Error("multiple variable declarations");
  }
  if (assignmentPaths.length === 1) {
    return { status: "ok", params: assignmentPaths[0].node.init.params };
  }

  const importWithSpecifierPaths = tree.grep(
    p.importWithSpecifier(idName),
    ast
  );
  if (importWithSpecifierPaths.length > 1) {
    throw new Error("multiple import specifiers");
  }

  if (importWithSpecifierPaths.length === 1) {
    const importNode = importWithSpecifierPaths[0].node;
    const specifiers = importNode.specifiers;
    const specifier = specifiers.find(
      specifier => specifier.local.name === idName
    );

    return {
      status: "function_imported_single",
      exportName: specifier.imported.name,
      source: importNode.source.value
    };
  }

  return { status: "identifier_not_followed" };
}

function findFunctionArgumentsFromNode(node, ast, { importParser } = {}) {
  if (["FunctionExpression", "ArrowFunctionExpression"].includes(node.type)) {
    return { status: "ok", params: node.params };
  }
  if (node.type === "Identifier" && node.name) {
    const result = findFunctionArgumentsFromIdentifier(node.name, ast);

    if (result.status === "function_imported_single" && importParser) {
      const importAst = importParser(result.source);
      return findFunctionArgumentsFromIdentifier(result.exportName, importAst);
    }

    return result;
  }

  return { status: "node_misunderstood" };
}

module.exports = {
  findFunctionArgumentsFromNode
};

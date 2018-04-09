var _ = require("lodash/fp");

const and = (...predicates) => path =>
  _.every(predicate => predicate(path), _.flatten(predicates));
const withType = type => path => path.node.type === type;
const isCall = withType("CallExpression");
const toCallee = name => path => {
  const callee = path.node.callee;
  return callee.type === "Identifier" && callee.name === name;
};
const withArgsLength = length => path => path.node.arguments.length === length;

module.exports = {
  and,
  withType,
  isCall,
  toCallee,
  withArgsLength
};

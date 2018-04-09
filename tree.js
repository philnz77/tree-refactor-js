var _ = require("lodash/fp");

const babylon = require("babylon");
const traverse = require("babel-traverse").default;

const moduleJsxSpreadOptions = {
  sourceType: "module",
  plugins: ["jsx", "objectRestSpread"]
};
const parse = _.curry((options, contents) => babylon.parse(contents, options));

const grep = _.curry((predicate, ast) => {
  const results = [];
  traverse(ast, {
    enter: function(path) {
      if (predicate(path)) {
        results.push(path);
      }
    }
  });
  return results;
});

module.exports = {
  moduleJsxSpreadOptions,
  parse,
  grep
};

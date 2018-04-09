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

const reorderArgs = swapOrder => path => {
  const nodeArgs = path.node.arguments;
  return {
    type: "swapSections",
    swapOrder,
    sections: nodeArgs.map(({ start, end }) => ({ start, end }))
  };
};

const renameCall = newCall => path => {
  const callee = path.node.callee;
  return {
    type: "changeSectionToStatic",
    newSectionText: newCall,
    section: {
      start: callee.start,
      end: callee.end
    }
  };
};

module.exports = {
  moduleJsxSpreadOptions,
  parse,
  grep,
  reorderArgs,
  renameCall
};

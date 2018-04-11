const assert = require("assert");
const { and, isCall, toCallee, withArgsLength } = require("../predicates");
const tree = require("../tree");

const parse = tree.parse(tree.moduleJsxSpreadOptions);
const file1 = `
import bar from './bar';
import { baz } from './baz';
console.log('a');
const x = bar(5);
const y = bar(5,6);
console.log(bar(7));
console.dir({
  a: 'b',
  ...baz(8)
});
`;

describe("tree", function() {
  describe("#grep()", function() {
    it("should find 3 bar calls in file1", function() {
      const ast = parse(file1);
      const grepBar = tree.grep(and(isCall, toCallee("bar")));
      const bars = grepBar(ast);
      assert.equal(bars.length, 3);
    });
    it("should find 1 bar calls with 2 args in file1", function() {
      const grepBar2Args = tree.grep(
        and(isCall, toCallee("bar"), withArgsLength(2))
      );
      const bars = grepBar2Args(parse(file1));
      assert.equal(bars.length, 1);
    });
    it("should find 1 baz calls with 1 arg in file1", function() {
      const bazs = tree.grep(
        and(isCall, toCallee("baz"), withArgsLength(1)),
        parse(file1)
      );
      assert.equal(bazs.length, 1);
    });
  });
});

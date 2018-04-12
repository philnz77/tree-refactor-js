var _ = require("lodash/fp");

const assert = require("assert");
const { and, isCall, toCallee, withArgsLength } = require("../predicates");
const tree = require("../tree");
const functionHunter = require("../functionHunter");

const parse = tree.parse(tree.moduleJsxSpreadOptions);
const file1 = `
import bar from './bar';
import { baz } from './baz';
import mapX from 'mapX';
import mapY from 'mapY';
import mapZ from 'mapZ';
import mapW from 'mapW';
import mapS from 'mapS';
import mapR from 'mapR';
import { sTransformer } from 'file2';
import * as v from 'fileV';
console.log('a');
const x = bar(5);
const y = bar(5,6);
console.log(bar(7));
console.dir({
  a: 'b',
  ...baz(8)
});
console.dir(mapX([1,2,3], x => x + 1));
console.dir(mapY([1,2,3], function(x){return x + 1}));
function zTransformer(x){return x + 1}
console.dir(mapZ([1,2,3], zTransformer));
const wTransformer = x => x + 1;
console.dir(mapW([1,2,3], wTransformer));
console.dir(mapS([1,2,3], sTransformer));
console.dir(mapR([1,2,3], v.vTransformer));
`;
const file2 = `
export const sTransformer = x => x + 1;
`;
const fileV = `
export const vTransformer = x => x + 1;
`;
const files = {
  file1,
  file2,
  fileV
};
const importParser = fileName => {
  const fileContents = files[fileName];
  if (!fileContents) {
    throw new Error("couldnt find file for " + fileName);
  }
  return parse(fileContents);
};

describe("functionHunter", function() {
  describe("#findFunctionArgumentsFromNode()", function() {
    it("should find a transformer with 1 param passed to mapX", function() {
      const ast = parse(file1);
      const mapPath = tree.grep(and(isCall, toCallee("mapX")), ast)[0];
      const findResult = functionHunter.findFunctionArgumentsFromNode(
        mapPath.node.arguments[1],
        ast
      );
      assert.equal(findResult.status, "ok");
      assert.equal(findResult.params.length, 1);
    });
    it("should find a transformer with 1 param passed to mapY", function() {
      const ast = parse(file1);
      const mapPath = tree.grep(and(isCall, toCallee("mapY")), ast)[0];
      const findResult = functionHunter.findFunctionArgumentsFromNode(
        mapPath.node.arguments[1],
        ast
      );
      assert.equal(findResult.status, "ok");
      assert.equal(findResult.params.length, 1);
    });
    it("should find a transformer with 1 param passed to mapZ", function() {
      const ast = parse(file1);
      const mapPath = tree.grep(and(isCall, toCallee("mapZ")), ast)[0];
      const findResult = functionHunter.findFunctionArgumentsFromNode(
        mapPath.node.arguments[1],
        ast
      );
      assert.equal(findResult.status, "ok");
      assert.equal(findResult.params.length, 1);
    });
    it("should find a transformer with 1 param passed to mapW", function() {
      const ast = parse(file1);
      const mapPath = tree.grep(and(isCall, toCallee("mapW")), ast)[0];
      const findResult = functionHunter.findFunctionArgumentsFromNode(
        mapPath.node.arguments[1],
        ast
      );
      assert.equal(findResult.status, "ok");
      assert.equal(findResult.params.length, 1);
    });
    it("should find a transformer with 1 param passed to mapS", function() {
      const ast = parse(file1);
      const mapPath = tree.grep(and(isCall, toCallee("mapS")), ast)[0];

      const findResult = functionHunter.findFunctionArgumentsFromNode(
        mapPath.node.arguments[1],
        ast,
        { importParser }
      );
      assert.equal(findResult.status, "ok");
      assert.equal(findResult.params.length, 1);
    });
    it("should find a transformer with 1 param passed to mapR", function() {
      const ast = parse(file1);
      const mapPath = tree.grep(and(isCall, toCallee("mapR")), ast)[0];

      const findResult = functionHunter.findFunctionArgumentsFromNode(
        mapPath.node.arguments[1],
        ast,
        { importParser }
      );
      assert.equal(findResult.status, "ok");
      assert.equal(findResult.params.length, 1);
    });
  });
});

var assert = require("assert");
var pure = require("../pure");
describe("Array", function() {
  describe("#createCharArray()", function() {
    it("should arrayify a string", function() {
      assert.deepEqual(pure.createCharArray("abc"), ["a", "b", "c"]);
    });
  });
  describe("#flattenCharArray()", function() {
    it("should do nothing to a string", function() {
      assert.deepEqual(pure.flattenCharArray("abc"), "abc");
    });
    it("should flatten a flat array", function() {
      assert.deepEqual(pure.flattenCharArray(["a", "b", "c"]), "abc");
    });
    it("should flatten a nested array and ignore nulls", function() {
      assert.deepEqual(
        pure.flattenCharArray(["a", ["b", "c", "d"], null, null, "e"]),
        "abcde"
      );
    });
  });
  describe("#changeSection()", function() {
    it("should change a section", function() {
      const origCharArray = pure.createCharArray("abcxxxe");
      const changedCharArray = pure.changeSection(
        origCharArray,
        { start: 3, end: 6 },
        "d"
      );
      assert.deepEqual(pure.flattenCharArray(changedCharArray), "abcde");
    });
    it("should change multiple sections", function() {
      const origCharArray = pure.createCharArray("abcxxxefyyklmzp");
      const changedX = pure.changeSection(
        origCharArray,
        { start: 3, end: 6 },
        "d"
      );
      const changedY = pure.changeSection(
        changedX,
        { start: 8, end: 10 },
        "ghij"
      );
      const changedZ = pure.changeSection(
        changedY,
        { start: 13, end: 14 },
        "no"
      );
      assert.deepEqual(pure.flattenCharArray(changedZ), "abcdefghijklmnop");
    });
  });
});

var assert = require("assert");
var jfactor = require("../");
describe("jfactor", function() {
  describe("#createCharArray()", function() {
    it("should arrayify a string", function() {
      assert.deepEqual(jfactor.createCharArray("abc"), ["a", "b", "c"]);
    });
  });
  describe("#flattenCharArray()", function() {
    it("should do nothing to a string", function() {
      assert.deepEqual(jfactor.flattenCharArray("abc"), "abc");
    });
    it("should flatten a flat array", function() {
      assert.deepEqual(jfactor.flattenCharArray(["a", "b", "c"]), "abc");
    });
    it("should flatten a nested array and ignore nulls", function() {
      assert.deepEqual(
        jfactor.flattenCharArray(["a", ["b", "c", "d"], null, null, "e"]),
        "abcde"
      );
    });
  });
  describe("#changeSectionToStatic()", function() {
    it("should change a section", function() {
      const origCharArray = jfactor.createCharArray("abcxxxe");
      const changedCharArray = jfactor.changeSectionToStatic(
        "d",

        { start: 3, end: 6 },
        origCharArray
      );
      assert.deepEqual(jfactor.flattenCharArray(changedCharArray), "abcde");
    });
    it("should change multiple sections", function() {
      const origCharArray = jfactor.createCharArray("abcxxxefyyklmzp");
      const changedX = jfactor.changeSectionToStatic(
        "d",

        { start: 3, end: 6 },
        origCharArray
      );
      const changedY = jfactor.changeSectionToStatic(
        "ghij",
        { start: 8, end: 10 },
        changedX
      );
      const changedZ = jfactor.changeSectionToStatic(
        "no",
        { start: 13, end: 14 },
        changedY
      );
      assert.deepEqual(jfactor.flattenCharArray(changedZ), "abcdefghijklmnop");
    });
  });
  describe("#swapSections", function() {
    it("should change a section", function() {
      const origCharArray = jfactor.createCharArray("bar(y, zz)");
      const swapped = jfactor.swapSections(
        [1, 0],
        [{ start: 4, end: 5 }, { start: 7, end: 9 }],
        origCharArray
      );

      assert.deepEqual(jfactor.flattenCharArray(swapped), "bar(zz, y)");
    });

    it("should change a nested section", function() {
      const origCharArray = jfactor.createCharArray("foo(x, bar(y, zz))");
      const swappedY = jfactor.swapSections(
        [1, 0],
        [{ start: 11, end: 12 }, { start: 14, end: 16 }],
        origCharArray
      );
      const swappedX = jfactor.swapSections(
        [1, 0],
        [{ start: 4, end: 5 }, { start: 7, end: 17 }],
        swappedY
      );
      assert.deepEqual(
        jfactor.flattenCharArray(swappedX),
        "foo(bar(zz, y), x)"
      );
    });

    it("should change a nested section where nested grows in size", function() {
      const origCharArray = jfactor.createCharArray("foo(x, bar(y, zz))");
      const swappedY = jfactor.swapSections(
        [1, 0],
        [{ start: 11, end: 12 }, { start: 14, end: 16 }],
        origCharArray
      );
      const swappedBar = jfactor.changeSectionToStatic(
        "bbaazz",
        { start: 7, end: 10 },
        swappedY
      );
      const swappedX = jfactor.swapSections(
        [1, 0],
        [{ start: 4, end: 5 }, { start: 7, end: 17 }],
        swappedBar
      );
      assert.deepEqual(
        jfactor.flattenCharArray(swappedX),
        "foo(bbaazz(zz, y), x)"
      );
    });
  });
  describe("#performTransformations", function() {
    it("should perform multiple translations", function() {
      const orig = "foo(x, bar(y, zz))";
      const transformations = [
        {
          type: "swapSections",
          swapOrder: [1, 0],
          sections: [{ start: 4, end: 5 }, { start: 7, end: 17 }]
        },
        {
          type: "swapSections",
          swapOrder: [1, 0],
          sections: [{ start: 11, end: 12 }, { start: 14, end: 16 }]
        },
        {
          type: "changeSectionToStatic",
          newSectionText: "bbaazz",
          section: { start: 7, end: 10 }
        }
      ];
      assert.deepEqual(
        jfactor.performTransformations(transformations, orig),
        "foo(bbaazz(zz, y), x)"
      );
    });
  });
});

var assert = require("assert");
var editor = require("../editor");
describe("editor", function() {
  describe("#createCharArray()", function() {
    it("should arrayify a string", function() {
      assert.deepEqual(editor.createCharArray("abc"), ["a", "b", "c"]);
    });
  });
  describe("#flattenCharArray()", function() {
    it("should do nothing to a string", function() {
      assert.deepEqual(editor.flattenCharArray("abc"), "abc");
    });
    it("should flatten a flat array", function() {
      assert.deepEqual(editor.flattenCharArray(["a", "b", "c"]), "abc");
    });
    it("should flatten a nested array and ignore nulls", function() {
      assert.deepEqual(
        editor.flattenCharArray(["a", ["b", "c", "d"], null, null, "e"]),
        "abcde"
      );
    });
  });
  describe("#changeSectionToStatic()", function() {
    it("should change a section", function() {
      const origCharArray = editor.createCharArray("abcxxxe");
      const changedCharArray = editor.changeSectionToStatic(
        "d",
        { start: 3, end: 6 },
        origCharArray
      );
      assert.deepEqual(editor.flattenCharArray(changedCharArray), "abcde");
    });
    it("should change multiple sections", function() {
      const origCharArray = editor.createCharArray("abcxxxefyyklmzp");
      const changedX = editor.changeSectionToStatic(
        "d",

        { start: 3, end: 6 },
        origCharArray
      );
      const changedY = editor.changeSectionToStatic(
        "ghij",
        { start: 8, end: 10 },
        changedX
      );
      const changedZ = editor.changeSectionToStatic(
        "no",
        { start: 13, end: 14 },
        changedY
      );
      assert.deepEqual(editor.flattenCharArray(changedZ), "abcdefghijklmnop");
    });
  });

  describe("#wrapSection()", function() {
    it("should wrap a section", function() {
      const origCharArray = editor.createCharArray("abcxxxe");
      const changedCharArray = editor.wrapSection(
        { prependText: "[", appendText: "]" },
        { start: 3, end: 6 },
        origCharArray
      );
      assert.deepEqual(editor.flattenCharArray(changedCharArray), "abc[xxx]e");
    });
  });

  describe("#swapSections", function() {
    it("should change a section", function() {
      const origCharArray = editor.createCharArray("bar(y, zz)");
      const swapped = editor.swapSections(
        [1, 0],
        [{ start: 4, end: 5 }, { start: 7, end: 9 }],
        origCharArray
      );

      assert.deepEqual(editor.flattenCharArray(swapped), "bar(zz, y)");
    });

    it("should change a nested section", function() {
      const origCharArray = editor.createCharArray("foo(x, bar(y, zz))");
      const swappedY = editor.swapSections(
        [1, 0],
        [{ start: 11, end: 12 }, { start: 14, end: 16 }],
        origCharArray
      );
      const swappedX = editor.swapSections(
        [1, 0],
        [{ start: 4, end: 5 }, { start: 7, end: 17 }],
        swappedY
      );
      assert.deepEqual(editor.flattenCharArray(swappedX), "foo(bar(zz, y), x)");
    });

    it("should change a nested section where nested grows in size", function() {
      const origCharArray = editor.createCharArray("foo(x, bar(y, zz))");
      const swappedY = editor.swapSections(
        [1, 0],
        [{ start: 11, end: 12 }, { start: 14, end: 16 }],
        origCharArray
      );
      const swappedBar = editor.changeSectionToStatic(
        "bbaazz",
        { start: 7, end: 10 },
        swappedY
      );
      const swappedX = editor.swapSections(
        [1, 0],
        [{ start: 4, end: 5 }, { start: 7, end: 17 }],
        swappedBar
      );
      assert.deepEqual(
        editor.flattenCharArray(swappedX),
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
        editor.performTransformations(transformations, orig),
        "foo(bbaazz(zz, y), x)"
      );
    });

    it("should perform multiple translations incuding wrap", function() {
      const orig = "bat(foo(x, bar(y, zz)))";
      const transformations = [
        {
            type: "swapSections",
          swapOrder: [1, 0],
          sections: [{ start: 8, end: 9 }, { start: 11, end: 21 }]
        },
        {
          type: "swapSections",
          swapOrder: [1, 0],
          sections: [{ start: 15, end: 16 }, { start: 18, end: 20 }]
        },
        {
          type: "changeSectionToStatic",
          newSectionText: "bbaazz",
          section: { start: 11, end: 14 }
        },
        {
          type: "wrapSection",
          wrapWith: { prependText: "[", appendText: "]" },
          section: { start: 4, end: 22 }
        }
      ];
      assert.deepEqual(
        editor.performTransformations(transformations, orig),
        "bat([foo(bbaazz(zz, y), x)])"
      );
    });
  });
});

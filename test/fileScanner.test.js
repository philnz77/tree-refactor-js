const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const assert = require("assert");
const editor = require("../editor");

const withTempDir = testFn => done => {
  const tempDir = fs.mkdtempSync("tmptest");
  try {
    testFn(tempDir);
  } finally {
    rimraf(tempDir, done);
  }
};

describe("fileScanner", function() {
  it(
    "should print the dir",
    withTempDir(tempDir => {
      const tempFile = path.join(tempDir, "a.js");
      fs.writeFileSync(tempFile, "console.log('foo')");
      console.log("===================");
      console.log(path.resolve(tempDir));
      console.log("===================");
    })
  );
});

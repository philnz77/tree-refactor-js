const assert = require("assert");

const { convertLodashGetToLodashFP } = require("../examples");

const lodashGetFile1 = `
import get from 'lodash/get';

function foo(x){
  return get(x, 'a.b.c');
}

function bar(x){
  return get(x, 'a.b.c', get(x, 'a.b.d'));
}
`;
const lodashFPGetFile1Expected = `
import get from 'lodash/fp/get';
import getOr from 'lodash/fp/getOr';

function foo(x){
  return get('a.b.c', x);
}

function bar(x){
  return getOr(get('a.b.d', x), 'a.b.c', x);
}
`;

describe("examples", function() {
  describe("#convertLodashGetToLodashFP()", function() {
    it("should lodash get to lodash fp equivalent", function() {
      const actual = convertLodashGetToLodashFP(lodashGetFile1);

      assert.equal(actual, lodashFPGetFile1Expected);
    });
  });
});

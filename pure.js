var _ = require("lodash/fp");

const createCharArray = s => s.split("");
function flattenCharArray(charArray) {
  if (_.isString(charArray)) {
    return charArray;
  }
  if (_.isArray(charArray)) {
    return charArray.map(flattenCharArray).join("");
  }
  return "";
}
function changeSection(charArray, start, end, newSectionText) {
  const changeRange = _.range(start, end);
  const indexAlreadyChanged = changeRange.find(i => !_.isString(charArray[i]));
  if (!_.isUndefined(indexAlreadyChanged)) {
    throw new Error(`
      Could not change section to because the char at ${indexAlreadyChanged} had alread been changed.
      Attempted new section text:
      ${newSectionText}
     `);
  }
  const result = [...charArray];
  _.each(function(i) {
    result[i] = null;
  }, changeRange);
  result[start] = createCharArray(newSectionText);
  return result;
}

module.exports = { createCharArray, flattenCharArray, changeSection };

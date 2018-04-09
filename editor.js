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

function blankSections(sections, charArray) {
  const result = [...charArray];
  _.each(function({ start, end }) {
    const changeRange = _.range(start, end);
    _.each(function(i) {
      result[i] = null;
    }, changeRange);
  }, sections);
  return result;
}

function changeSectionToStatic(newSectionText, section, charArray) {
  const { start, end } = section;
  const changeRange = _.range(start, end);
  const indexAlreadyChanged = changeRange.find(i => !_.isString(charArray[i]));
  if (!_.isUndefined(indexAlreadyChanged)) {
    throw new Error(`
      Could not change section because the char at ${indexAlreadyChanged} had already been changed.
      Attempted new section text:
      ${newSectionText}
     `);
  }
  const result = blankSections([section], charArray);
  result[start] = createCharArray(newSectionText);
  return result;
}
const sortNumbersAsc = _.sortBy(_.identity);
const csv = _.join(",");
const getStartsAndEnds = _.pipe([_.map(s => [s.start, s.end]), _.flatten]);

function validateSectionForEditing({ start, end }, charArray) {
  if (_.isNull(charArray[start])) {
    throw new Error(
      `start (${start}) of swap section is in the middle of a change`
    );
  }
  if (end >= charArray.length) {
    throw new Error(`end (${end}) of swap section is off the end`);
  }
  if (end < charArray.length - 1 && _.isNull(charArray[end + 1])) {
    throw new Error(
      `end (${end}) of swap section is in the middle of a change`
    );
  }
}
function validateSwapSectionsParams(swapOrder, sections, charArray) {
  if (sections.length === 0) {
    throw new Error("sections is empty");
  }
  const swapOrderStr = csv(swapOrder);
  const noOrderStr = csv(_.range(0, sections.length));
  if (swapOrderStr === noOrderStr) {
    throw new Error(
      `swap order ${swapOrderStr} is invalid, nothing is specified to be swapped`
    );
  }
  if (csv(sortNumbersAsc(swapOrder)) !== noOrderStr) {
    throw new Error(
      `swap order ${swapOrderStr} is invalid, should be some rearrangement of ${noOrderStr}`
    );
  }
  const startAndEnds = getStartsAndEnds(sections);
  const startAndEndsCsv = csv(startAndEnds);

  if (startAndEndsCsv !== csv(sortNumbersAsc(startAndEnds))) {
    throw new Error(
      `starts and ends across sections should all be in order: ${startAndEndsCsv} ${csv(
        sortNumbersAsc(startAndEnds)
      )}`
    );
  }
  _.each(section => {
    validateSectionForEditing(section, charArray);
  }, sections);
}

function swapSections(swapOrder, sections, charArray) {
  validateSwapSectionsParams(swapOrder, sections, charArray);
  const result = blankSections(sections, charArray);
  for (let i = 0; i < sections.length; i++) {
    const fromSection = sections[i];
    const toSection = sections[swapOrder[i]];
    result[toSection.start] = charArray.slice(
      fromSection.start,
      fromSection.end
    );
  }
  return result;
}

const sortSwapSectionsTransformations = _.sortBy(
  ({ sections }) => _.last(sections).end - sections[0].start
);
const staticReducer = (charArray, transformation) =>
  changeSectionToStatic(
    transformation.newSectionText,
    transformation.section,
    charArray
  );
const swapReducer = (charArray, transformation) =>
  swapSections(transformation.swapOrder, transformation.sections, charArray);

function performTransformations(transformations, text) {
  const [statics, swaps] = _.partition(
    t => t.type === "changeSectionToStatic",
    transformations
  );
  const sortedSwaps = sortSwapSectionsTransformations(swaps);

  const startingCharArray = createCharArray(text);
  const charArrayAfterStatic = _.reduce(
    staticReducer,
    startingCharArray,
    statics
  );
  const charArrayAfterSwaps = _.reduce(
    swapReducer,
    charArrayAfterStatic,
    sortedSwaps
  );
  return flattenCharArray(charArrayAfterSwaps);
}

module.exports = {
  createCharArray,
  flattenCharArray,
  changeSectionToStatic,
  swapSections,
  performTransformations
};

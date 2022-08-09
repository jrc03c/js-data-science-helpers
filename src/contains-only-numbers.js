const {
  flatten,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
  set,
} = require("@jrc03c/js-math-tools")

function containsOnlyNumbers(x) {
  if (isSeries(x)) {
    return containsOnlyNumbers(x.values)
  }

  if (isDataFrame(x)) {
    return containsOnlyNumbers(x.values)
  }

  if (isNumber(x)) {
    return true
  }

  if (isArray(x)) {
    const temp = flatten(x)
    const types = set(temp.map(v => typeof v))
    return types.length === 1 && types[0] === "number"
  }

  return false
}

module.exports = containsOnlyNumbers

const {
  assert,
  flatten,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
} = require("@jrc03c/js-math-tools")

function containsOnlyNumbers(x) {
  if (isDataFrame(x) || isSeries(x)) {
    return containsOnlyNumbers(x.values)
  }

  assert(
    isArray(x),
    "The `containsOnlyNumbers` function only works on arrays, Series, and DataFrames!"
  )

  const temp = flatten(x)

  for (let i = 0; i < temp.length; i++) {
    if (!isNumber(temp[i])) {
      return false
    }
  }

  return true
}

module.exports = containsOnlyNumbers

const {
  assert,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
  pow,
  sqrt,
  sum,
} = require("@jrc03c/js-math-tools")
const containsOnlyNumbers = require("./contains-only-numbers.js")

function getMagnitude(x) {
  if (isSeries(x)) {
    return getMagnitude(x.values)
  }

  if (isDataFrame(x)) {
    return getMagnitude(x.values)
  }

  if (isNumber(x)) {
    return Math.abs(x)
  }

  if (isArray(x)) {
    assert(
      containsOnlyNumbers(x),
      "Arrays passed into the `getMagnitude` function cannot contain NaN values!"
    )

    return sqrt(sum(pow(x, 2)))
  }

  return undefined
}

module.exports = getMagnitude

const {
  dropNaN,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
  pow,
  sqrt,
  sum,
} = require("@jrc03c/js-math-tools")

const common = require("./common.js")

function getMagnitude(x) {
  if (isDataFrame(x) || isSeries(x)) {
    return getMagnitude(x.values)
  }

  if (isNumber(x)) {
    return Math.abs(x)
  }

  if (isArray(x)) {
    if (common.shouldIgnoreNaNValues) {
      x = dropNaN(x)
    }

    return sqrt(sum(pow(x, 2)))
  }

  return NaN
}

module.exports = getMagnitude

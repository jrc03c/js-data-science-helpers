const {
  abs,
  assert,
  dropNaNPairwise,
  flatten,
  isArray,
  isDataFrame,
  isEqual,
  isSeries,
  mean,
  remap,
  round,
  shape,
  sqrt,
  std,
} = require("@jrc03c/js-math-tools")

const common = require("./common")
const zTable = require("./z-table.json")

function probability(z) {
  if (abs(z) > 4.1) return 0
  return zTable[round(remap(abs(z), 0, 4.1, 0, zTable.length))]
}

function ttest(a, b) {
  if (isDataFrame(a) || isSeries(a)) {
    return ttest(a.values, b)
  }

  if (isDataFrame(b) || isSeries(b)) {
    return ttest(a, b.values)
  }

  assert(
    isArray(a) && isArray(b) && isEqual(shape(a), shape(b)),
    "You must pass two identically-shaped arrays, Series, or DataFrames into the `pValue` function!"
  )

  const [aTemp, bTemp] = common.shouldIgnoreNaNValues
    ? dropNaNPairwise(flatten(a), flatten(b))
    : [flatten(a), flatten(b)]

  if (aTemp.length === 0 || bTemp.length === 0) {
    return NaN
  }

  const m1 = mean(aTemp)
  const m2 = mean(bTemp)
  const s1 = std(aTemp)
  const s2 = std(bTemp)
  const n1 = aTemp.length
  const n2 = bTemp.length
  const t = (m1 - m2) / sqrt((s1 * s1) / n1 + (s2 * s2) / n2)
  return 2 * probability(t)
}

module.exports = ttest

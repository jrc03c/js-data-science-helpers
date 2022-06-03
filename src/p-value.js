const zTable = require("./z-table.json")

const {
  abs,
  assert,
  dropNaNPairwise,
  isArray,
  map,
  mean,
  round,
  shape,
  sqrt,
  std,
} = require("@jrc03c/js-math-tools")

function probability(z) {
  if (abs(z) > 4.1) return 0
  return zTable[round(map(abs(z), 0, 4.1, 0, zTable.length))]
}

function ttest(a, b) {
  assert(
    isArray(a) && shape(a).length === 1,
    "You must pass two one-dimensional arrays into the `pValue` (AKA `ttest`) function!"
  )

  assert(
    isArray(b) && shape(b).length === 1,
    "You must pass two one-dimensional arrays into the `pValue` (AKA `ttest`) function!"
  )

  const [aTemp, bTemp] = dropNaNPairwise(a, b)

  assert(
    aTemp.length > 0,
    "There are no numerical values in the first vector you passed into the `pValue` (AKA `ttest`) function!"
  )

  assert(
    bTemp.length > 0,
    "There are no numerical values in the second vector you passed into the `pValue` (AKA `ttest`) function!"
  )

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

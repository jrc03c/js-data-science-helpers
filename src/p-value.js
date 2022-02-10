const zTable = require("./z-table.json")
const {
  isUndefined,
  assert,
  isArray,
  shape,
  abs,
  round,
  map,
  mean,
  std,
  sqrt,
  pow,
  dropNaNPairwise,
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

  let [aTemp, bTemp] = dropNaNPairwise(a, b)

  assert(
    aTemp.length > 0,
    "There are no numerical values in the first vector you passed into the `pValue` (AKA `ttest`) function!"
  )

  assert(
    bTemp.length > 0,
    "There are no numerical values in the second vector you passed into the `pValue` (AKA `ttest`) function!"
  )

  let m1 = mean(aTemp)
  let m2 = mean(bTemp)
  let s1 = std(aTemp)
  let s2 = std(bTemp)
  let n1 = aTemp.length
  let n2 = bTemp.length
  // let v1 = n1 - 1
  // let v2 = n2 - 1

  let t = (m1 - m2) / sqrt((s1 * s1) / n1 + (s2 * s2) / n2)

  // let v =
  //   pow((s1 * s1) / n1 + (s2 * s2) / n2, 2) /
  //   (pow(s1, 4) / (n1 * n1 * v1) + pow(s2, 4) / (n2 * n2 * v2))

  return 2 * probability(t)
}

module.exports = ttest

const {
  assert,
  dropNaN,
  isArray,
  isSeries,
  mean,
  shape,
  variance,
} = require("@jrc03c/js-math-tools")

const common = require("./common")

function cohensd(arr1, arr2) {
  if (isSeries(arr1)) {
    return cohensd(arr1.values, arr2)
  }

  if (isSeries(arr2)) {
    return cohensd(arr1, arr2.values)
  }

  assert(
    isArray(arr1) &&
      isArray(arr2) &&
      shape(arr1).length === 1 &&
      shape(arr2).length === 1,
    "The `cohensd` function only works on 1-dimensional arrays and Series!"
  )

  assert(
    arr1.length === arr2.length,
    "Two arrays or Series passed into the `cohensd` function must have the same length!"
  )

  if (common.shouldIgnoreNaNValues) {
    arr1 = dropNaN(arr1)
    arr2 = dropNaN(arr2)
  }

  try {
    const m1 = mean(arr1)
    const m2 = mean(arr2)
    const s = Math.sqrt((variance(arr1) + variance(arr2)) / 2)
    return (m1 - m2) / s
  } catch (e) {
    return NaN
  }
}

module.exports = cohensd

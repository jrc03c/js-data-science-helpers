const {
  abs,
  apply,
  assert,
  clamp,
  copy,
  divide,
  dropNaN,
  flatten,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
  max,
  median,
  min,
  sort,
  subtract,
} = require("@jrc03c/js-math-tools")

const common = require("./common")
const containsOnlyNumbers = require("./contains-only-numbers")
const isBinary = require("./is-binary")

function clipOutliers(x, maxScore) {
  if (isDataFrame(x) || isSeries(x)) {
    const out = x.copy()
    out._values = clipOutliers(out._values, maxScore)
    return out
  }

  assert(
    isArray(x),
    "The `clipOutliers` function only works on arrays, Series, and DataFrames!"
  )

  maxScore = maxScore || 5

  assert(
    isNumber(maxScore),
    "Any `maxScore` value passed into the `clipOutliers` function must be a number!"
  )

  if (!common.shouldIgnoreNaNValues) {
    if (!containsOnlyNumbers(x)) {
      return apply(x, () => NaN)
    }
  }

  const xFlat = flatten(x)
  const numericalValues = dropNaN(xFlat)

  if (isBinary(numericalValues)) {
    return x
  }

  if (numericalValues.length === 0) {
    return x
  }

  const xMedian = median(numericalValues)
  let xMad = median(abs(subtract(numericalValues, xMedian)))
  let outlierIsImmediatelyAboveOrBelowMedian = false

  if (xMad === 0) {
    const temp = sort(copy(numericalValues))
    const low = temp.filter(value => value < xMedian)
    const high = temp.filter(value => value > xMedian)
    let before = xMedian
    let after = xMedian

    if (low.length > 0) before = max(low)
    if (high.length > 0) after = min(high)

    xMad = (after - before) / 2

    if (xMad === 0) {
      return x
    }

    outlierIsImmediatelyAboveOrBelowMedian =
      (xMedian - before) / xMad > maxScore ||
      (after - xMedian) / xMad > maxScore
  }

  const score = max(divide(abs(subtract(numericalValues, xMedian)), xMad))

  if (score > maxScore || outlierIsImmediatelyAboveOrBelowMedian) {
    return apply(x, v => {
      if (isNumber(v)) {
        return clamp(v, xMedian - maxScore * xMad, xMedian + maxScore * xMad)
      } else {
        return v
      }
    })
  } else {
    return x
  }
}

module.exports = clipOutliers

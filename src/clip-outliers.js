const {
  abs,
  add,
  assert,
  clamp,
  copy,
  dropNaN,
  isArray,
  isNumber,
  max,
  median,
  min,
  pow,
  scale,
  shape,
  sort,
} = require("@jrc03c/js-math-tools")

const isBinary = require("./is-binary.js")
const divide = (a, b) => scale(a, pow(b, -1))
const subtract = (a, b) => add(a, scale(b, -1))

function clipOutliers(x, maxScore) {
  maxScore = maxScore || 5

  assert(isNumber(maxScore), "`maxScore` must be a number!")
  assert(isArray(x), "`x` must be a one-dimensional array!")
  assert(shape(x).length === 1, "`x` must be a one-dimensional array!")

  const numericalValues = dropNaN(x)
  if (isBinary(numericalValues)) return [x, false]
  if (numericalValues.length === 0) return [x, false]

  const xMedian = median(numericalValues)
  let xMad = median(abs(subtract(numericalValues, xMedian)))

  if (xMad === 0) {
    const temp = sort(copy(numericalValues))
    const low = temp.filter(value => value < xMedian)
    const high = temp.filter(value => value > xMedian)
    let before = xMedian
    let after = xMedian

    if (low.length > 0) before = max(low)
    if (high.length > 0) after = min(high)

    xMad = (after - before) / 2
    if (xMad === 0) return [x, false]
  }

  const score = max(divide(abs(subtract(numericalValues, xMedian)), xMad))

  if (score > maxScore) {
    const out = x.map(v => {
      if (typeof v === "number") {
        return clamp(v, xMedian - maxScore * xMad, xMedian + maxScore * xMad)
      } else {
        return v
      }
    })

    return [out, true]
  } else {
    return [x, false]
  }
}

// console.warn(
//   "The `clipOutliers` function does not handle at least one edge case: in cases where an outlier is the value immediately above or below the median, the `clipOutliers` function will fail to transform the data! This is a known problem, but we haven't found a fix for it yet. :("
// )

module.exports = clipOutliers

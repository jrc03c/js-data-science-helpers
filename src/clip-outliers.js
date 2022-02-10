let {
  assert,
  isNumber,
  isArray,
  shape,
  isUndefined,
  median,
  abs,
  add,
  scale,
  copy,
  int,
  max,
  min,
  clamp,
  dropNaN,
  sort,
  pow,
} = require("@jrc03c/js-math-tools")

let isBinary = require("./is-binary.js")
let subtract = (a, b) => add(a, scale(b, -1))
let divide = (a, b) => scale(a, pow(b, -1))

function clipOutliers(x, maxScore) {
  maxScore = maxScore || 5

  assert(isNumber(maxScore), "`maxScore` must be a number!")
  assert(isArray(x), "`x` must be a one-dimensional array!")
  assert(shape(x).length === 1, "`x` must be a one-dimensional array!")

  let numericalValues = dropNaN(x)
  if (isBinary(numericalValues)) return [x, false]
  if (numericalValues.length === 0) return [x, false]

  let xMedian = median(numericalValues)
  let xMad = median(abs(subtract(numericalValues, xMedian)))

  if (xMad === 0) {
    let temp = sort(copy(numericalValues))
    let low = temp.filter(value => value < xMedian)
    let high = temp.filter(value => value > xMedian)
    let before = xMedian
    let after = xMedian

    if (low.length > 0) before = max(low)
    if (high.length > 0) after = min(high)

    xMad = (after - before) / 2
    if (xMad === 0) return [x, false]
  }

  let score = max(divide(abs(subtract(numericalValues, xMedian)), xMad))

  if (score > maxScore) {
    let out = x.map(v => {
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

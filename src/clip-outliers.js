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
  if (isBinary(numericalValues)) return { values: x, wasClipped: false }
  if (numericalValues.length === 0) return { values: x, wasClipped: false }

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
      return { values: x, wasClipped: false }
    }

    outlierIsImmediatelyAboveOrBelowMedian =
      (xMedian - before) / xMad > maxScore ||
      (after - xMedian) / xMad > maxScore
  }

  const score = max(divide(abs(subtract(numericalValues, xMedian)), xMad))

  if (score > maxScore || outlierIsImmediatelyAboveOrBelowMedian) {
    const out = x.map(v => {
      if (typeof v === "number") {
        return clamp(v, xMedian - maxScore * xMad, xMedian + maxScore * xMad)
      } else {
        return v
      }
    })

    return { values: out, wasClipped: true }
  } else {
    return { values: x, wasClipped: false }
  }
}

module.exports = clipOutliers

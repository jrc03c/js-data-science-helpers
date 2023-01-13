const {
  apply,
  assert,
  dropNaN,
  isArray,
  isDataFrame,
  isSeries,
  mean,
  std,
} = require("@jrc03c/js-math-tools")

const common = require("./common")

function normalize(x) {
  if (isDataFrame(x) || isSeries(x)) {
    const out = x.copy()
    out.values = normalize(out.values)
    return out
  }

  assert(
    isArray(x),
    "The `normalize` function only works on arrays, Series, and DataFrames!"
  )

  const m = (() => {
    if (common.shouldIgnoreNaNValues) {
      return mean(dropNaN(x))
    } else {
      return mean(x)
    }
  })()

  const s = (() => {
    if (common.shouldIgnoreNaNValues) {
      return std(dropNaN(x))
    } else {
      return std(x)
    }
  })()

  return s === 0 ? x : apply(x, v => (v - m) / s)
}

module.exports = normalize

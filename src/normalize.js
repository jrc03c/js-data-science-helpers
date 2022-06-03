const {
  assert,
  dropNaN,
  isArray,
  mean,
  shape,
  std,
} = require("@jrc03c/js-math-tools")

function normalize(x) {
  assert(isArray(x), "The `normalize` function only works on vectors!")

  assert(
    shape(x).length === 1,
    "The `normalize` function only works on vectors!"
  )

  // note that this is a "missing-aware" function!
  const nonMissingValues = dropNaN(x)
  const m = mean(nonMissingValues)
  const s = std(nonMissingValues)

  if (s === 0) return x

  return x.map(value => {
    if (typeof value === "number") {
      return (value - m) / s
    } else {
      return value
    }
  })
}

module.exports = normalize

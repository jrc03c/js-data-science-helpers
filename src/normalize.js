let {
  assert,
  isArray,
  shape,
  Series,
  mean,
  std,
  isUndefined,
  dropNaN,
} = require("@jrc03c/js-math-tools")

function normalize(x) {
  assert(isArray(x), "The `normalize` function only works on vectors!")

  assert(
    shape(x).length === 1,
    "The `normalize` function only works on vectors!"
  )

  // note that this is a "missing-aware" function!
  let nonMissingValues = dropNaN(x)
  let m = mean(nonMissingValues)
  let s = std(nonMissingValues)

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

const {
  assert,
  dropNaN,
  isArray,
  mean,
  shape,
  std,
  transpose,
} = require("@jrc03c/js-math-tools")

const isJagged = require("./is-jagged.js")

const errorMessage =
  "The `normalize` function only works on vectors, matrices, Series, or DataFrames!"

function normalize(x) {
  if (x.copy && x.values) {
    const out = x.copy()
    out.values = normalize(out.values)
    return out
  } else if (isArray(x)) {
    assert(
      !isJagged(x),
      "The `normalize` function doesn't work on jagged arrays!"
    )

    const xShape = shape(x)

    if (xShape.length > 1) {
      if (xShape.length > 2) {
        throw new Error(errorMessage)
      }

      return transpose(transpose(x).map(col => normalize(col)))
    }
  } else {
    throw new Error(errorMessage)
  }

  const numbers = dropNaN(x)

  if (numbers.length === 0) {
    return x
  }

  const m = mean(numbers)
  const s = std(numbers)

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

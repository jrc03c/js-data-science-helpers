let { isArray, shape, assert, zeros } = require("@jrc03c/js-math-tools")

function diagonalize(x) {
  assert(isArray(x), "The `diagonalize` function only works on vectors!")

  let xShape = shape(x)

  assert(
    xShape.length === 1,
    "The `diagonalize` function only works on vectors!"
  )

  let out = zeros([xShape[0], xShape[0]])
  x.forEach((v, i) => (out[i][i] = v))
  return out
}

module.exports = diagonalize

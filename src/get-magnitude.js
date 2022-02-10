let { assert, isArray, sqrt, sum, pow } = require("@jrc03c/js-math-tools")
let containsOnlyNumbers = require("./contains-only-numbers.js")

function getMagnitude(x) {
  assert(isArray(x), "`getMagnitude` only works on vectors!")

  assert(
    containsOnlyNumbers(x),
    "`getMagnitude` only works on vectors of numbers!"
  )

  return sqrt(sum(pow(x, 2)))
}

module.exports = getMagnitude

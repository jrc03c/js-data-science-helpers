const {
  abs,
  add,
  assert,
  isArray,
  isEqual,
  mean,
  pow,
  scale,
  shape,
  sign,
  sqrt,
  sum,
} = require("@jrc03c/js-math-tools")

const containsOnlyNumbers = require("./contains-only-numbers.js")
const subtract = (a, b) => add(a, scale(b, -1))

function rScore(xtrue, xpred) {
  assert(
    isArray(xtrue),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    isArray(xpred),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    isEqual(shape(xtrue), shape(xpred)),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    containsOnlyNumbers(xtrue),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    containsOnlyNumbers(xpred),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  const num = sum(pow(subtract(xtrue, xpred), 2))
  const den = sum(pow(subtract(xtrue, mean(xtrue)), 2))
  if (den === 0) return NaN
  const r2 = 1 - num / den
  return sign(r2) * sqrt(abs(r2))
}

module.exports = rScore

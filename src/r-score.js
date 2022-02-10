let containsOnlyNumbers = require("./contains-only-numbers.js")
let subtract = (a, b) => add(a, scale(b, -1))
let {
  sum,
  pow,
  mean,
  sign,
  sqrt,
  abs,
  add,
  scale,
  isEqual,
  shape,
  assert,
  isArray,
} = require("@jrc03c/js-math-tools")

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

  let num = sum(pow(subtract(xtrue, xpred), 2))
  let den = sum(pow(subtract(xtrue, mean(xtrue)), 2))
  if (den === 0) return 0
  let r2 = 1 - num / den
  return sign(r2) * sqrt(abs(r2))
}

module.exports = rScore

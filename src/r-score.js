const {
  abs,
  add,
  assert,
  isArray,
  isDataFrame,
  isEqual,
  isSeries,
  mean,
  pow,
  scale,
  shape,
  sign,
  sqrt,
  sum,
} = require("@jrc03c/js-math-tools")

const containsOnlyNumbers = require("./contains-only-numbers")
const subtract = (a, b) => add(a, scale(b, -1))

function rScore(xTrue, xPred) {
  if (isDataFrame(xTrue) || isSeries(xTrue)) {
    return rScore(xTrue.values, xPred)
  }

  if (isDataFrame(xPred) || isSeries(xPred)) {
    return rScore(xTrue, xPred.values)
  }

  assert(
    isArray(xTrue),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    isArray(xPred),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    isEqual(shape(xTrue), shape(xPred)),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    containsOnlyNumbers(xTrue),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  assert(
    containsOnlyNumbers(xPred),
    "You must pass two same-shaped numerical arrays into the `rScore` function!"
  )

  const num = sum(pow(subtract(xTrue, xPred), 2))
  const den = sum(pow(subtract(xTrue, mean(xTrue)), 2))
  if (den === 0) return NaN
  const r2 = 1 - num / den
  return sign(r2) * sqrt(abs(r2))
}

module.exports = rScore

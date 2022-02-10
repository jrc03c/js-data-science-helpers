let { assert, isArray, shape, scale, dot } = require("@jrc03c/js-math-tools")
let containsOnlyNumbers = require("./contains-only-numbers.js")

function project(v, u) {
  assert(isArray(v), "`project` only works on vectors!")
  assert(isArray(u), "`project` only works on vectors!")
  assert(containsOnlyNumbers(v), "`project` only works on vectors of numbers!")
  assert(containsOnlyNumbers(u), "`project` only works on vectors of numbers!")
  assert(shape(v).length === 1, "`project` only works on vectors!")
  assert(shape(u).length === 1, "`project` only works on vectors!")
  return scale(dot(u, v) / dot(u, u), u)
}

module.exports = project

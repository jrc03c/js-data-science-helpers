const {
  assert,
  dot,
  isArray,
  isSeries,
  scale,
  Series,
  shape,
} = require("@jrc03c/js-math-tools")

const containsOnlyNumbers = require("./contains-only-numbers")

function project(v, u) {
  if (isSeries(v)) {
    if (isSeries(u)) {
      return new Series(project(v.values, u.values))
    } else {
      const out = v.copy()
      out.values = project(v.values, u)
      return out
    }
  }

  if (isSeries(u)) {
    const out = u.copy()
    out.values = project(v, u.values)
    return out
  }

  assert(isArray(v), "`project` only works on vectors!")
  assert(isArray(u), "`project` only works on vectors!")
  assert(containsOnlyNumbers(v), "`project` only works on vectors of numbers!")
  assert(containsOnlyNumbers(u), "`project` only works on vectors of numbers!")
  assert(shape(v).length === 1, "`project` only works on vectors!")
  assert(shape(u).length === 1, "`project` only works on vectors!")
  return scale(dot(u, v) / dot(u, u), u)
}

module.exports = project

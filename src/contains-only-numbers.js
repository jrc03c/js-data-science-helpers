const { assert, flatten, isArray, set } = require("@jrc03c/js-math-tools")

function containsOnlyNumbers(x) {
  assert(isArray(x), "The `containsOnlyNumbers` only works on arrays!")
  const temp = flatten(x)
  const types = set(temp.map(v => typeof v))
  return types.length === 1 && types[0] === "number"
}

module.exports = containsOnlyNumbers

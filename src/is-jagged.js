const { assert, isArray, shape } = require("@jrc03c/js-math-tools")

function isJagged(x) {
  assert(isArray(x), "The `isJagged` function only works on arrays!")

  try {
    shape(x)
    return false
  } catch (e) {
    return true
  }
}

module.exports = isJagged

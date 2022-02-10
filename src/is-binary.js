let {
  assert,
  isArray,
  Series,
  sort,
  set,
  flatten,
  dropNaN,
} = require("@jrc03c/js-math-tools")

function isBinary(x) {
  if (typeof x === "number") {
    return x === 0 || x === 1
  }

  if (isArray(x)) {
    let nonMissingValues = dropNaN(flatten(x))
    let values = sort(set(nonMissingValues))

    return (
      (values.length === 2 && values[0] === 0 && values[1] === 1) ||
      (values.length === 1 && (values[0] === 0 || values[0] === 1))
    )
  }

  return false
}

module.exports = isBinary

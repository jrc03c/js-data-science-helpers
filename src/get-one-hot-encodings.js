const {
  assert,
  isArray,
  isString,
  isUndefined,
  set,
  shape,
  sort,
} = require("@jrc03c/js-math-tools")

function getOneHotEncodings(name, values) {
  assert(
    isString(name),
    "The first parameter passed into the `getOneHotEncodings` function must be a string representing the name of the variable being encoded."
  )

  assert(
    isArray(values) && shape(values).length === 1,
    "The second parameter passed into the `getOneHotEncodings` function must be a one-dimensional array of values."
  )

  const out = {}
  const colToDrop = name + "_" + values[0]

  const colNames = sort(set(values))
    .filter(v => !isUndefined(v))
    .map(v => name + "_" + v)
    .filter(v => v !== colToDrop)

  colNames.forEach(colName => {
    out[colName] = values.map(v => (colName === name + "_" + v ? 1 : 0))
  })

  return out
}

module.exports = getOneHotEncodings

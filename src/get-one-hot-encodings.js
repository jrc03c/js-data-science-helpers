const {
  assert,
  DataFrame,
  isArray,
  isSeries,
  isString,
  isUndefined,
  set,
  shape,
  sort,
} = require("@jrc03c/js-math-tools")

function getOneHotEncodings() {
  if (arguments.length === 1 && isSeries(arguments[0])) {
    const { name, values } = arguments[0]
    const encodings = getOneHotEncodings(name, values)
    const out = new DataFrame(encodings)
    out.index = arguments[0].index.slice()
    return out
  }

  const [name, values] = arguments

  assert(
    isString(name),
    "When passing two arguments into the `getOneHotEncodings` function, the first argument must be a string representing the name of the variable being encoded!"
  )

  assert(
    isArray(values) && shape(values).length === 1,
    "When passing two arguments into the `getOneHotEncodings` function, the second argument must be a 1-dimensional array!"
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

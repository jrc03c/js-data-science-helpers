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

  const colNames = sort(set(values))
    .filter(v => typeof v !== "number" || v.toString() !== "NaN")
    .filter(v => !isUndefined(v))
    .map(v => name + "_" + v)
    .slice(0, -1)

  colNames.forEach(colName => {
    out[colName] = values.map(v => {
      if (colName === name + "_" + v) {
        return 1
      }

      if (typeof v === "number" && v.toString() === "NaN") {
        return NaN
      }

      if (isUndefined(v)) {
        return NaN
      }

      return 0
    })
  })

  return out
}

module.exports = getOneHotEncodings

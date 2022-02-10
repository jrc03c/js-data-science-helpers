let {
  assert,
  DataFrame,
  isEqual,
  transpose,
  sort,
  set,
} = require("@jrc03c/js-math-tools")

let containsOnlyNumbers = require("./contains-only-numbers.js")

function getHighlyCorrelatedColumns(correlations) {
  assert(
    correlations instanceof DataFrame,
    "You must pass a correlation matrix DataFrame into the `getHighlyCorrelatedColumns` function!"
  )

  assert(
    containsOnlyNumbers(correlations.values),
    "The correlation matrix DataFrame passed into the `getHighlyCorrelatedColumns` function must contain only numbers!"
  )

  assert(
    isEqual(correlations.values, transpose(correlations.values)),
    "The correlation matrix DataFrame passed into the `getHighlyCorrelatedColumns` function must be symmetrical!"
  )

  assert(
    isEqual(correlations.columns, correlations.index),
    "The correlation matrix DataFrame passed into the `getHighlyCorrelatedColumns` function must be symmetrical!"
  )

  let out = {}

  for (let i = 0; i < correlations.index.length; i++) {
    for (let j = 0; j < correlations.columns.length; j++) {
      if (i !== j) {
        let value = correlations.values[i][j]

        // note that this only detects columns that are highly POSITIVELY correlated!
        if (1 - value < 1e-5) {
          let rowName = correlations.index[i]
          let colName = correlations.columns[j]
          if (!out[rowName]) out[rowName] = []
          if (!out[colName]) out[colName] = []
          out[rowName].push(colName)
          out[colName].push(rowName)
        }
      }
    }
  }

  Object.keys(out).forEach(key => {
    out[key] = sort(set(out[key]))
  })

  return out
}

module.exports = getHighlyCorrelatedColumns

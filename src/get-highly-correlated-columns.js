const {
  DataFrame,
  isArray,
  isDataFrame,
  isNumber,
  MathError,
  sort,
} = require("@jrc03c/js-math-tools")

const getCorrelationMatrix = require("./get-correlation-matrix")
const isCorrelationMatrix = require("./is-correlation-matrix")

function getHighlyCorrelatedColumns(a, b, threshold) {
  threshold = Object.values(arguments).find(v => isNumber(v)) || 1 - 1e-5

  const c = (() => {
    const arrays = Object.values(arguments).filter(
      v => isArray(v) || isDataFrame(v)
    )

    if (arrays.length === 1) {
      const x = arrays[0]

      if (isCorrelationMatrix(x)) {
        return isDataFrame(x) ? x : new DataFrame(x)
      } else {
        const out = getCorrelationMatrix(x, null)
        return isDataFrame(out) ? out : new DataFrame(out)
      }
    }

    if (arrays.length === 2) {
      const out = getCorrelationMatrix(arrays[0], arrays[1])
      return isDataFrame(out) ? out : new DataFrame(out)
    }

    throw new MathError(
      "You must pass 1 or 2 2-dimensional arrays or DataFrames into the `getHighlyCorrelatedColumns` function!"
    )
  })()

  const out = {}

  c.values.forEach((row, i) => {
    row.forEach((value, j) => {
      if (isNumber(value) && value > threshold) {
        const rowName = c.index[i]
        const colName = c.columns[j]

        if (!out[rowName]) {
          out[rowName] = []
        }

        if (out[rowName].indexOf(colName) < 0) {
          out[rowName].push(colName)
        }

        if (!out[colName]) {
          out[colName] = []
        }

        if (out[colName].indexOf(rowName) < 0) {
          out[colName].push(rowName)
        }
      }
    })
  })

  Object.keys(out).forEach(key => {
    out[key] = sort(out[key])
  })

  return out
}

module.exports = getHighlyCorrelatedColumns

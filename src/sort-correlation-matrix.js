const {
  argmax,
  assert,
  copy,
  DataFrame,
  dot,
  isArray,
  isDataFrame,
  isEqual,
  isJagged,
  isNumber,
  reverse,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

// NOTE: This assumes a correlation matrix that represents the internal
// correlations of a single dataset; i.e., the correlations of each column with
// each other column in a dataset, NOT the correlations among columns of two
// datasets! Therefore, it should be expected that the matrix passed into this
// function will be symmetrical!
function sortCorrelationMatrix(c) {
  if (isArray(c)) {
    assert(
      shape(c).length === 2 && !isJagged(c),
      "The `sortCorrelationMatrix` function only works on non-jagged 2-dimensional arrays and DataFrames!"
    )

    const temp = new DataFrame(c)
    temp.index = temp.columns.slice()
    return sortCorrelationMatrix(temp).values
  }

  assert(
    isDataFrame(c),
    "You must pass a 2-dimensional array or DataFrame into the `sortCorrelationMatrix` function!"
  )

  // for each value:
  // - if the value is NaN, then replace it with -Infinity and record its
  //   original value and position in the matrix
  // - otherwise, check to make sure that it falls between -1 and 1
  const temp = c.copy()
  const nans = []

  temp.values.forEach((row, i) => {
    row.forEach((v, j) => {
      if (!isNumber(v)) {
        nans.push({ row: temp.index[i], col: temp.columns[j], value: v })
        temp.values[i][j] = -Infinity
      } else {
        assert(
          v >= -1 && v <= 1,
          "The correlation matrix passed into the `sortCorrelationMatrix` function must not contain values less than -1 or greater than 1!"
        )
      }
    })
  })

  assert(
    isEqual(temp.values, transpose(temp.values)),
    "The correlation matrix passed into the `sortCorrelationMatrix` function must be symmetrical!"
  )

  assert(
    isEqual(temp.index, temp.columns),
    "The correlation matrix passed into the `sortCorrelationMatrix` function must be symmetrical! (In this case, although the values themselves are symmetrical, the row and column names differ.)"
  )

  const freeRows = copy(temp.index)
  const fixedRows = []

  while (freeRows.length > 0) {
    // get row with greatest 2-norm
    if (fixedRows.length === 0) {
      const index = argmax(temp.values.map(row => dot(row, row)))
      fixedRows.push(freeRows[index])
      freeRows.splice(index, 1)
    }

    // get free row with highest correlation with first fixed row
    // and fix it
    else {
      const lastFixedRowIndex = temp.index.indexOf(fixedRows.at(-1))

      const nextRowIndex = argmax(
        freeRows.map(rowName => {
          const row = temp.values[temp.index.indexOf(rowName)]
          return row[lastFixedRowIndex]
        })
      )

      const nextRowName = freeRows[nextRowIndex]
      fixedRows.push(nextRowName)
      freeRows.splice(nextRowIndex, 1)
    }
  }

  const reversedFixedRows = reverse(fixedRows)
  const out = temp.get(reversedFixedRows, reversedFixedRows)

  // if there were any nans in the original matrix, then insert them back into
  // the output matrix
  nans.forEach(n => {
    const i = out.index.indexOf(n.row)
    const j = out.columns.indexOf(n.col)
    out.values[i][j] = n.value
    out.values[j][i] = n.value
  })

  return out
}

module.exports = sortCorrelationMatrix

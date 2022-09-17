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
  max,
  min,
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
      "The `sortCorrelationMatrix` function only works on 2-dimensional arrays and DataFrames!"
    )

    const temp = new DataFrame(c)
    temp.index = temp.columns.slice()
    return sortCorrelationMatrix(temp).values
  }

  assert(
    isDataFrame(c),
    "You must pass a DataFrame into the `sortCorrelationMatrix` function!"
  )

  assert(
    max(c.values) <= 1 && min(c.values) >= -1,
    "The correlation matrix passed into the `sortCorrelationMatrix` function must not contain values less than -1 or greater than 1!"
  )

  assert(
    isEqual(c.values, transpose(c.values)),
    "The correlation matrix passed into the `sortCorrelationMatrix` function must be symmetrical!"
  )

  assert(
    isEqual(c.index, c.columns),
    "The correlation matrix passed into the `sortCorrelationMatrix` function must be symmetrical! (In this case, although the values themselves are symmetrical, the row and column names differ.)"
  )

  const freeRows = copy(c.index)
  const fixedRows = []

  while (freeRows.length > 0) {
    // get row with greatest 2-norm
    if (fixedRows.length === 0) {
      const index = argmax(c.values.map(row => dot(row, row)))
      fixedRows.push(freeRows[index])
      freeRows.splice(index, 1)
    }

    // get free row with highest correlation with first fixed row
    // and fix it
    else {
      const lastFixedRowIndex = c.index.indexOf(fixedRows.at(-1))

      const nextRowIndex = argmax(
        freeRows.map(rowName => {
          const row = c.values[c.index.indexOf(rowName)]
          return row[lastFixedRowIndex]
        })
      )

      const nextRowName = freeRows[nextRowIndex]
      fixedRows.push(nextRowName)
      freeRows.splice(nextRowIndex, 1)
    }
  }

  const reversedFixedRows = reverse(fixedRows)
  return c.get(reversedFixedRows, reversedFixedRows)
}

module.exports = sortCorrelationMatrix

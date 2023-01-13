const {
  assert,
  copy,
  correl,
  DataFrame,
  dropMissing,
  isArray,
  isDataFrame,
  isEqual,
  isJagged,
  isNumber,
  set,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

const clipOutliers = require("./clip-outliers")
const getOneHotEncodings = require("./get-one-hot-encodings")
const inferType = require("./infer-type")

function preprocess(df, maxUniqueStrings, correlationThreshold) {
  maxUniqueStrings = isNumber(maxUniqueStrings) ? maxUniqueStrings : 7

  correlationThreshold = isNumber(correlationThreshold)
    ? correlationThreshold
    : 1 - 1e-5

  if (isArray(df)) {
    assert(
      shape(df).length === 2 && !isJagged(df),
      "The `preprocess` function only works on non-jagged 2-dimensional arrays and DataFrames!"
    )

    return preprocess(new DataFrame(df))
  }

  assert(
    isDataFrame(df),
    "You must pass a DataFrame into the `preprocess` function!"
  )

  const types = {}

  df = df.apply(col => {
    const results = inferType(col.values)
    types[col.name] = results.type
    return results.values
  })

  const columns = copy(df.columns)
  const x = transpose(df.values)
  let index = 0
  let isDone = false

  // delete literally identical columns
  while (!isDone) {
    const col1 = x[index]

    for (let i = index + 1; i < x.length; i++) {
      const col2 = x[i]

      if (isEqual(col1, col2)) {
        columns.splice(i, 1)
        x.splice(i, 1)
      }
    }

    index++
    isDone = index >= columns.length - 1
  }

  // only examine each column once!
  index = 0
  isDone = false

  while (!isDone) {
    const colName = columns[index]
    const values = x[index]
    if (!values) break

    // get non-missing values
    const nonMissingValues = dropMissing(values)

    // if there are fewer than 15 non-missing values, then drop the column
    if (nonMissingValues.length < 15) {
      columns.splice(index, 1)
      x.splice(index, 1)
      continue
    }

    // if there's only 1 unique value, then drop the column
    const nonMissingValuesSet = set(nonMissingValues)

    if (nonMissingValuesSet.length === 1) {
      columns.splice(index, 1)
      x.splice(index, 1)
      continue
    }

    // get primary data type of the column
    const type = types[colName]

    if (type === "string") {
      // if there are up to 7 unique values, then one-hot-encode them
      if (nonMissingValuesSet.length <= maxUniqueStrings) {
        const encodings = getOneHotEncodings(colName, values)

        Object.keys(encodings).forEach(key => {
          columns.push(key)
          x.push(encodings[key])
          types[key] = "number"
        })

        columns.splice(index, 1)
        x.splice(index, 1)
        continue
      }
    } else if (type === "number") {
      const clippedValues = clipOutliers(values)
      x[index] = clippedValues
      let wasHighlyCorrelated = false

      for (let i = 0; i < index; i++) {
        const otherValues = x[i]
        const r = correl(values, otherValues)

        if (r > correlationThreshold) {
          columns.splice(index, 1)
          x.splice(index, 1)
          wasHighlyCorrelated = true
          break
        }
      }

      if (wasHighlyCorrelated) continue
    } else {
      x.splice(index, 1)
      columns.splice(index, 1)
      continue
    }

    index++
    isDone = index >= columns.length
  }

  const out = new DataFrame(transpose(x))
  out.columns = columns
  return out
}

module.exports = preprocess

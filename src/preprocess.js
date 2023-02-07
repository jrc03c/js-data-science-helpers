const {
  assert,
  correl,
  DataFrame,
  dropMissing,
  inferType,
  isArray,
  isDataFrame,
  isEqual,
  isFunction,
  isJagged,
  isNumber,
  isUndefined,
  set,
  shape,
} = require("@jrc03c/js-math-tools")

const clipOutliers = require("./clip-outliers")
const getOneHotEncodings = require("./get-one-hot-encodings")
const getNthColumn = (x, n) => x.map(row => row[n])
const isWholeNumber = x => isNumber(x) && (parseInt(x) === x || x === Infinity)

function preprocess(df, config) {
  config = config || {}

  const maxUniqueStrings = isNumber(config.maxUniqueStrings)
    ? config.maxUniqueStrings
    : 7

  const minNonMissingValues = isNumber(config.minNonMissingValues)
    ? config.minNonMissingValues
    : 15

  const maxCorrelationThreshold = isNumber(config.maxCorrelationThreshold)
    ? config.maxCorrelationThreshold
    : 1 - 1e-5

  const progress = config.progress || null

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

  assert(
    isWholeNumber(maxUniqueStrings),
    "`maxUniqueStrings` must be a whole number!"
  )

  assert(
    isWholeNumber(minNonMissingValues),
    "`minNonMissingValues` must be a whole number!"
  )

  assert(
    isNumber(maxCorrelationThreshold),
    "`maxCorrelationThreshold` must be a number!"
  )

  if (!isUndefined(progress)) {
    assert(isFunction(progress), "If defined, `progress` must be a function!")
  }

  // transpose the data so that it's easier to work with; i.e., grabbing rows is easier
  // (and much faster) than grabbing columns, though I'm not really sure how expensive
  // the transpositions are...
  const types = {}
  const columnsToDrop = {}
  const outValues = {}

  // for each row:
  // - get its column name
  // - run self-checks:
  //   - if its column name is in the `columnsToDrop` array, then return
  //   - get its data type and casted values; if they've already been cached, then retrieve them from the `types` object; otherwise, compute them and cache them in the `types` object; then:
  //   - if type in [null, object], then add to `columnsToDrop` array and return
  //   - drop missing values, then:
  //   - if it has fewer than 15 non-missing values, then add to `columnsToDrop` array and return
  //   - get the set of values, then:
  //   - if it has only 1 unique value, then add to `columnsToDrop` array and return
  //   - if its type is "string" and it has fewer than `maxUniqueStrings` unique values, then one-hot-encode it, add its one-hot-encoded column names to the `columnsToKeep` array, add its original name to the `columnsToDrop` array, and then return
  // - run other-checks (against other columns that have not already been marked to be dropped)
  //   - if type is "number" and is highly correlated with another "number" column, then add the latter column name to the `columnsToDrop` array
  //   - if type is "string" and is identical to another "string" column, then add the latter column name to the `columnsToDrop` array
  // - if we've made it this far, then add its column name to the `columnsToKeep` array

  const x = df.values

  df.columns.forEach((colName, j) => {
    if (columnsToDrop[colName]) return

    const values = getNthColumn(x, j)

    const parsed = (() => {
      if (types[colName]) {
        return types[colName]
      } else {
        const results = inferType(values)

        if (results.type === "date") {
          results.values = results.values.map(v => v - 0)
        }

        types[colName] = results
        return results
      }
    })()

    if (parsed.type === "null" || parsed.type === "object") {
      columnsToDrop[colName] = true
      return
    }

    const nonMissingValues = dropMissing(parsed.values)

    if (nonMissingValues.length <= minNonMissingValues) {
      columnsToDrop[colName] = true
      return
    }

    const nonMissingValuesSet = set(nonMissingValues)

    if (nonMissingValuesSet.length < 2) {
      columnsToDrop[colName] = true
      return
    }

    if (
      parsed.type === "string" &&
      nonMissingValuesSet.length <= maxUniqueStrings
    ) {
      const encodings = getOneHotEncodings(colName, parsed.values)

      Object.keys(encodings).forEach(key => {
        outValues[key] = encodings[key]
      })

      columnsToDrop[colName] = true
      return
    }

    if (parsed.type === "number") {
      parsed.values = clipOutliers(parsed.values)
    }

    df.columns.slice(j + 1).forEach((otherColName, k) => {
      if (columnsToDrop[otherColName]) return

      const otherValues = getNthColumn(x, j + k + 1)

      const otherParsed = (() => {
        if (types[otherColName]) {
          return types[otherColName]
        } else {
          const results = inferType(otherValues)

          if (results.type === "date") {
            results.values = results.values.map(v => v - 0)
          }

          types[otherColName] = results
          return results
        }
      })()

      if (otherParsed.type !== parsed.type) return

      if (otherParsed.type === "number") {
        const r = correl(otherParsed.values, parsed.values)

        if (r > maxCorrelationThreshold) {
          columnsToDrop[otherColName] = true
          return
        }
      }

      if (
        otherParsed.type === "string" &&
        isEqual(otherParsed.values, parsed.values)
      ) {
        columnsToDrop[otherColName] = true
        return
      }
    })

    outValues[colName] = parsed.values

    if (progress) {
      progress(j / df.columns.length)
    }
  })

  const out = new DataFrame(outValues)
  out.index = df.index.slice()
  return out
}

module.exports = preprocess

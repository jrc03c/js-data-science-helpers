const {
  add,
  correl,
  DataFrame,
  dropMissing,
  flatten,
  int,
  isEqual,
  normal,
  pow,
  random,
  range,
  scale,
  Series,
  set,
  shuffle,
} = require("@jrc03c/js-math-tools")

const makeKey = require("@jrc03c/make-key")
const convertToNumerical = require("./convert-to-numerical")

// generate data with these types:
//   - booleans
//   - dates from a small set
//   - dates that are completely random
//   - floats from a small set
//   - floats that are completely random
//   - integers from a small set
//   - integers that are completely random
//   - objects from a small set
//   - objects that are completely random
//   - strings from a small set
//   - strings that are completely random
// drop some random values
// duplicate some of the already-existing columns
// add some mostly empty columns
// add some completely empty columns
// add some columns with only 1 unique value
// add a few columns that are highly correlated with some of the float columns

test("tests that DataFrames can be converted to all numerical values correctly", () => {
  const n = 100

  const booleans = range(0, n).map(() => (random() < random() ? 1 : 0))

  const datesFromSmallSet = (() => {
    const datesSet = range(0, 7).map(
      () => new Date(int(random() * new Date().getTime()))
    )

    return range(0, n).map(() => datesSet[int(random() * datesSet.length)])
  })()

  const datesAllUnique = range(0, n).map(
    () => new Date(int(random() * new Date().getTime()))
  )

  const floatsFromSmallSet = (() => {
    const floatSet = normal(7)
    return range(0, n).map(() => floatSet[int(random() * floatSet.length)])
  })()

  const floatsAllUnique = normal(n)

  const intsFromSmallSet = (() => {
    const intSet = range(-3, 4)
    return range(0, n).map(() => intSet[int(random() * intSet.length)])
  })()

  const intsAllUnique = shuffle(range(0, n)).map(v => int(v - n / 2))

  const objectsFromSmallSet = (() => {
    const objectsSet = range(0, 10).map(() => ({
      x: random(),
      y: random(),
      z: random(),
    }))

    return range(0, n).map(() => objectsSet[int(random() * objectsSet.length)])
  })()

  const objectsAllUnique = range(0, n).map(() => ({
    x: random(),
    y: random(),
    z: random(),
  }))

  const stringsFromSmallSet = (() => {
    const stringSet = range(0, 7).map(() => makeKey(8))
    return range(0, n).map(() => stringSet[int(random() * stringSet.length)])
  })()

  const stringsAllUnique = range(0, n).map(() => makeKey(8))

  const nulls = range(0, n).map(() => shuffle([null, undefined, NaN])[0])

  let df = new DataFrame({
    booleans,
    datesFromSmallSet,
    datesAllUnique,
    floatsFromSmallSet,
    floatsAllUnique,
    intsFromSmallSet,
    intsAllUnique,
    objectsFromSmallSet,
    objectsAllUnique,
    stringsFromSmallSet,
    stringsAllUnique,
    nulls,
  })

  // randomly delete some values
  range(0, 0.05 * df.shape[0] * df.shape[1]).forEach(() => {
    const i = int(random() * df.shape[0])
    const j = int(random() * df.shape[1])
    df.values[i][j] = shuffle([null, undefined, NaN])[0]
  })

  // duplicate some existing columns
  range(0, 3).forEach(() => {
    const colName = df.columns[int(random() * df.columns.length)]
    df = df.assign(colName + " (duplicate)", df.get(null, colName).values)
  })

  // add some columns that are mostly missing values
  range(0, 3).forEach(i => {
    const threshold = random() * 0.5

    df = df.assign(
      "floatsWithLotsMissing" + i,
      normal(n).map(v => (random() < threshold ? v : NaN))
    )
  })

  // add some columns with 1 unique value
  range(0, 3).map(() => {
    const colName = df.columns[int(random() * df.columns.length)]
    const value = df.get(colName).values[0]

    df = df.assign(
      makeKey(8) + " (1 unique)",
      range(0, n).map(() => value)
    )
  })

  // add some columns that are partially correlated with the existing float
  // columns
  range(-5, 5).map(i => {
    const noiseScale = pow(2, i)
    const colName = `floatsAllUnique + ${noiseScale.toFixed(4)} * noise`
    df = df.assign(colName, add(floatsAllUnique, scale(noiseScale, normal(n))))
  })

  // convert to numerical data
  const dfCleaned = convertToNumerical(df)

  // check that the resulting DataFrame contains only numbers and NaNs
  flatten(dfCleaned.values).forEach(v => {
    expect(typeof v).toBe("number")
  })

  // check that no columns are very highly correlated
  dfCleaned.apply(col1 => {
    dfCleaned.apply(col2 => {
      if (col1.name !== col2.name && !isEqual(col1.values, col2.values)) {
        const r = correl(col1, col2)

        if (!isNaN(r)) {
          expect(r).toBeLessThan(0.99999)
        }
      }
    })
  })

  // check that no columns have more than 15 missing values
  dfCleaned.apply(col => {
    const nonMissingValues = dropMissing(col.values)
    expect(col.values.length - nonMissingValues.length).toBeLessThan(15)
  })

  // check that no columns have a single unique value
  dfCleaned.apply(col => {
    const valuesSet = set(dropMissing(col.values))
    expect(valuesSet.length).toBeGreaterThan(1)
  })

  // check that columns containing small sets of values have been one-hot
  // encoded
  const oneHotColumns = [
    "datesFromSmallSet",
    "floatsFromSmallSet",
    "intsFromSmallSet",
    "objectsFromSmallSet",
    "stringsFromSmallSet",
  ]

  oneHotColumns.forEach(colName => {
    expect(dfCleaned.columns.includes(colName)).toBe(false)
  })
})

test("throws an error when attempting to convertToNumerical non-DataFrames", () => {
  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    [2, 3, 4],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new Series({ hello: [10, 20, 30, 40, 50] }),
  ]

  wrongs.forEach(item => {
    expect(() => convertToNumerical(item)).toThrow()
  })
})

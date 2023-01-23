const {
  add,
  DataFrame,
  dropNaN,
  int,
  isEqual,
  max,
  min,
  ndarray,
  normal,
  random,
  range,
  scale,
  Series,
  sort,
  transpose,
} = require("@jrc03c/js-math-tools")

const getCorrelationMatrix = require("./get-correlation-matrix")
const makeKey = require("@jrc03c/make-key")
const preprocess = require("./preprocess")

// generate data with these types:
//   - floats
//   - integers from a small set
//   - integers that are completely random
//   - strings from a small set
//   - strings that are completely random
//   - booleans
//   - dates (in what format?)
// drop some random values
// duplicate some of the already-existing columns
// add some mostly empty columns
// add some completely empty columns
// add some columns with only 1 unique value
// add a few columns that are highly correlated with some of the float columns

test("drops duplicate columns", () => {
  const temp = random(100)
  const x = new DataFrame({ a: temp, b: temp, c: normal(100), d: temp })
  const yPred = preprocess(x)
  expect(isEqual(yPred.columns, ["a", "c"])).toBe(true)
  expect(isEqual(yPred.get(null, 0).values, temp)).toBe(true)
})

test("drops highly correlated columns", () => {
  const a = random(100)
  const b = add(a, scale(0.0001, normal(100)))
  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(isEqual(yPred.columns, ["a"])).toBe(true)
  expect(isEqual(yPred.get(null, 0).values, a)).toBe(true)
})

test("drops columns with less than 15 non-missing values", () => {
  const a = random(100)
  const b = range(0, 100).map(() => NaN)

  for (let i = 0; i < 10; i++) {
    b[int(random() * b.length)] = random()
  }

  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(isEqual(yPred.columns, ["a"])).toBe(true)
  expect(isEqual(yPred.get(null, 0).values, a)).toBe(true)
})

test("drops empty columns", () => {
  const a = random(100)
  const b = range(0, 100).map(() => null)
  const c = random(100)
  const d = range(0, 100).map(() => undefined)
  const e = range(0, 100).map(() => NaN)
  const x = new DataFrame({ a, b, c, d, e })
  const yPred = preprocess(x)
  expect(isEqual(yPred.columns, ["a", "c"])).toBe(true)
  expect(isEqual(yPred.get(null, 0).values, a)).toBe(true)
  expect(isEqual(yPred.get(null, 1).values, c)).toBe(true)
})

test("drops columns with only 1 unique value", () => {
  const a = random(100)
  const r = random()
  const b = range(0, 100).map(() => r)
  const k = makeKey(8)
  const c = range(0, 100).map(() => k)
  const x = new DataFrame({ a, b, c })
  const yPred = preprocess(x)
  expect(isEqual(yPred.columns, ["a"])).toBe(true)
  expect(isEqual(yPred.get(null, 0).values, a)).toBe(true)
})

test("clips outliers", () => {
  const a = random(100)
  const b = random(100)
  b[0] = 99999
  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(isEqual(yPred.columns, ["a", "b"])).toBe(true)
  expect(isEqual(yPred.get(null, 0).values, a)).toBe(true)
  expect(isEqual(yPred.get(null, 1).values, b)).toBe(false)
})

// ----------------------------------------------------------------------------
// UPDATE 2022-07-28: This test is being deactivated because I've removed this
// behavior from the `preprocess` function. See the note in the function itself
// for more info.
// ----------------------------------------------------------------------------
// test("drops string columns with 100% unique values", () => {
//   const a = random(100)
//   const b = range(0, 100).map(i => makeKey(8))
//   const x = new DataFrame({ a, b })
//   const yPred = preprocess(x)
//   expect(isEqual(yPred.columns, ["a"])).toBe(true)
//   expect(isEqual(yPred.get(null, 0).values, a)).toBe(true)
// })

test("one-hot-encodes string columns with 7 or fewer unique values", () => {
  const a = random(100)

  const values = range(0, 6).map(() => makeKey(8))
  const b = range(0, 100).map(() => values[int(random() * values.length)])

  const moreValues = range(0, 10).map(() => makeKey(8))
  const c = range(0, 100).map(
    () => moreValues[int(random() * moreValues.length)]
  )

  const x = new DataFrame({ a, b, c })
  const yPred = preprocess(x)

  expect(
    isEqual(
      sort(yPred.columns),
      sort(
        ["a", "c"].concat(
          values.map(v => "b_" + v).filter(v => v !== "b_" + b[0])
        )
      )
    )
  ).toBe(true)
})

test("correctly preprocesses an ugly data set", () => {
  // generate data with these types:
  //   - floats
  //   - integers from a small set
  //   - integers that are completely random
  //   - strings from a small set
  //   - strings that are completely random
  //   - booleans
  //   - dates (in what format?)
  // drop some random values
  // duplicate some of the already-existing columns
  // add some mostly empty columns
  // add some completely empty columns
  // add some columns with only 1 unique value
  // add a few columns that are highly correlated with some of the float columns
  const nullValues = ["null", "NaN", "NA", "N/A", "", "undefined"]
  const n = 100
  const data = []
  const columns = []

  // add floats
  for (let i = 0; i < 5; i++) {
    const col = scale(add(normal(n), normal() * 100), normal() * 100)
    data.push(col)
    columns.push(`float${i}`)
  }

  // add a few columns that are highly correlated with the floats
  for (let i = 0; i < 5; i++) {
    const index = int(random() * data.length)
    const col = add(data[index], scale(0.0001, normal(n)))
    const colName = columns[index]
    data.push(col)
    columns.push(`${colName}_highlyCorrelated${i}`)
  }

  // add integers from a small set
  for (let i = 0; i < 5; i++) {
    const values = range(0, 5).map(() => int(normal() * 100))
    const col = range(0, n).map(() => values[int(random() * values.length)])
    data.push(col)
    columns.push(`intSmallSet${i}`)
  }

  // add unique integers
  for (let i = 0; i < 5; i++) {
    const col = int(scale(add(normal(n), normal() * 100), normal() * 100))
    data.push(col)
    columns.push(`int${i}`)
  }

  // add strings from a small set
  for (let i = 0; i < 5; i++) {
    const values = range(0, 5).map(() => makeKey(8))
    const col = range(0, n).map(() => values[int(random() * values.length)])
    data.push(col)
    columns.push(`stringSmallSet${i}`)
  }

  // add unique strings
  for (let i = 0; i < 5; i++) {
    const col = range(0, n).map(() => makeKey(8))
    data.push(col)
    columns.push(`string${i}`)
  }

  // add booleans
  data.push(range(0, n).map(() => (random() < 0.33 ? "True" : "False")))
  columns.push(`bool0`)

  data.push(range(0, n).map(() => (random() < 0.75 ? "YES" : "NO")))
  columns.push(`bool1`)

  data.push(range(0, n).map(() => random() < 0.5))
  columns.push(`bool2`)

  data.push(range(0, n).map(() => (random() < 0.5 ? "TRUE" : "FALSE")))
  columns.push(`bool3`)

  data.push(range(0, n).map(() => random() < 0.95))
  columns.push(`bool4`)

  // add dates
  for (let i = 0; i < 5; i++) {
    const format = int(random() * 3)

    const col = range(0, n)
      .map(() => {
        const year = int(random() * 50 + 1970)
        const month = int(random() * 12 + 1)
        const day = int(random() * 28 + 1)
        const hour = int(random() * 24)
        const minute = int(random() * 60)
        const dateString = `${month}-${day}-${year} ${hour}:${minute}`
        return dateString
      })
      .map(v => {
        const out = new Date(v)

        if (format === 0) {
          return v
        } else if (format === 1) {
          return out.toJSON()
        } else if (format === 2) {
          return out.toString()
        }
      })

    data.push(col)
    columns.push(`date${i}`)
  }

  // drop some values
  for (let i = 0; i < 0.1 * n * columns.length; i++) {
    const y = int(random() * data.length)
    const x = int(random() * n)
    data[y][x] = nullValues[int(random() * nullValues.length)]
  }

  // duplicate some columns
  for (let i = 0; i < 5; i++) {
    const index = int(random() * data.length)
    const col = data[index]
    const colName = columns[index]
    data.push(col)
    columns.push(`${colName}_duplicate${i}`)
  }

  // add some mostly-empty columns
  for (let i = 0; i < 5; i++) {
    const col = ndarray(n)

    for (let j = 0; j < 10; j++) {
      col[int(random() * col.length)] = random()
    }

    data.push(col)
    columns.push(`mostlyEmpty${i}`)
  }

  // add some completely empty columns
  for (let i = 0; i < 5; i++) {
    const value = nullValues[int(random() * nullValues.length)]
    const col = range(0, n).map(() => value)
    data.push(col)
    columns.push(`completelyEmpty${i}`)
  }

  // add some columns with 1 unique value
  for (let i = 0; i < 5; i++) {
    const value = int(random() * 100)
    const col = range(0, n).map(() => value)
    data.push(col)
    columns.push(`oneUnique${i}`)
  }

  const data1 = new DataFrame(transpose(data))
  const data2 = preprocess(data1)
  const c = new DataFrame(getCorrelationMatrix(data2.values))
  c.columns = data2.columns
  c.index = data2.columns
  expect(max(dropNaN(c))).toBeLessThanOrEqual(1)
  expect(min(dropNaN(c))).toBeGreaterThanOrEqual(-1)
})

test("throws an error when attempting to preprocess non-DataFrames", () => {
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
    expect(() => preprocess(item)).toThrow()
  })
})

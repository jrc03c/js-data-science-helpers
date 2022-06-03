const getCorrelationMatrix = require("./get-correlation-matrix.js")
const makeKey = require("@jrc03c/make-key")
const preprocess = require("./preprocess.js")

const {
  add,
  DataFrame,
  flatten,
  int,
  ndarray,
  normal,
  random,
  range,
  scale,
  sort,
  transpose,
} = require("@jrc03c/js-math-tools")

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
  const temp = random(1000)
  const x = new DataFrame({ a: temp, b: temp, c: normal(1000), d: temp })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a", "c"])
  expect(yPred.get(null, 0).values).toStrictEqual(temp)
})

test("drops highly correlated columns", () => {
  const a = random(1000)
  const b = add(a, scale(0.0001, normal(1000)))
  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a"])
  expect(yPred.get(null, 0).values).toStrictEqual(a)
})

test("drops columns with less than 15 non-missing values", () => {
  const a = random(1000)
  const b = range(0, 1000).map(i => NaN)

  for (let i = 0; i < 10; i++) {
    b[int(random() * b.length)] = random()
  }

  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a"])
  expect(yPred.get(null, 0).values).toStrictEqual(a)
})

test("drops empty columns", () => {
  const a = random(1000)
  const b = range(0, 1000).map(i => null)
  const c = random(1000)
  const d = range(0, 1000).map(i => undefined)
  const e = range(0, 1000).map(i => NaN)
  const x = new DataFrame({ a, b, c, d, e })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a", "c"])
  expect(yPred.get(null, 0).values).toStrictEqual(a)
  expect(yPred.get(null, 1).values).toStrictEqual(c)
})

test("drops columns with only 1 unique value", () => {
  const a = random(1000)
  const r = random()
  const b = range(0, 1000).map(i => r)
  const k = makeKey(8)
  const c = range(0, 1000).map(i => k)
  const x = new DataFrame({ a, b, c })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a"])
  expect(yPred.get(null, 0).values).toStrictEqual(a)
})

test("clips outliers", () => {
  const a = random(1000)
  const b = random(1000)
  b[0] = 99999
  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a", "b"])
  expect(yPred.get(null, 0).values).toStrictEqual(a)
  expect(yPred.get(null, 1).values).not.toStrictEqual(b)
})

test("drops string columns with 100% unique values", () => {
  const a = random(1000)
  const b = range(0, 1000).map(i => makeKey(8))
  const x = new DataFrame({ a, b })
  const yPred = preprocess(x)
  expect(yPred.columns).toStrictEqual(["a"])
  expect(yPred.get(null, 0).values).toStrictEqual(a)
})

test("one-hot-encodes string columns with 7 or fewer unique values", () => {
  const a = random(1000)

  const values = range(0, 6).map(i => makeKey(8))
  const b = range(0, 1000).map(i => values[int(random() * values.length)])

  const moreValues = range(0, 10).map(i => makeKey(8))
  const c = range(0, 1000).map(
    i => moreValues[int(random() * moreValues.length)]
  )

  const x = new DataFrame({ a, b, c })
  const yPred = preprocess(x)

  expect(sort(yPred.columns)).toStrictEqual(
    sort(
      ["a", "c"].concat(
        values.map(v => "b_" + v).filter(v => v !== "b_" + b[0])
      )
    )
  )
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
  const n = 1000
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
    const values = range(0, 5).map(v => int(normal() * 100))
    const col = range(0, n).map(v => values[int(random() * values.length)])
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
    const values = range(0, 5).map(v => makeKey(8))
    const col = range(0, n).map(v => values[int(random() * values.length)])
    data.push(col)
    columns.push(`stringSmallSet${i}`)
  }

  // add unique strings
  for (let i = 0; i < 5; i++) {
    const col = range(0, n).map(v => makeKey(8))
    data.push(col)
    columns.push(`string${i}`)
  }

  // add booleans
  data.push(range(0, n).map(v => (random() < 0.33 ? "True" : "False")))
  columns.push(`bool0`)

  data.push(range(0, n).map(v => (random() < 0.75 ? "YES" : "NO")))
  columns.push(`bool1`)

  data.push(range(0, n).map(v => random() < 0.5))
  columns.push(`bool2`)

  data.push(range(0, n).map(v => (random() < 0.5 ? "TRUE" : "FALSE")))
  columns.push(`bool3`)

  data.push(range(0, n).map(v => random() < 0.95))
  columns.push(`bool4`)

  // add dates
  for (let i = 0; i < 5; i++) {
    const format = int(random() * 3)

    const col = range(0, n)
      .map(v => {
        const year = int(random() * 50 + 1970)
        const month = int(random() * 12 + 1)
        const day = int(random() * 28 + 1)
        const hour = int(random() * 24)
        const minute = int(random() * 60)
        const leftPad = x => (x.toString().length < 2 ? "0" + x : x)
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
    const col = range(0, n).map(v => value)
    data.push(col)
    columns.push(`completelyEmpty${i}`)
  }

  // add some columns with 1 unique value
  for (let i = 0; i < 5; i++) {
    const value = int(random() * 100)
    const col = range(0, n).map(v => value)
    data.push(col)
    columns.push(`oneUnique${i}`)
  }

  const data1 = new DataFrame(transpose(data))
  const data2 = preprocess(data1)
  const c = new DataFrame(getCorrelationMatrix(data2.values))
  c.columns = data2.columns
  c.index = data2.columns

  for (let i = 0; i < c.values.length; i++) {
    c.values[i][i] = -Infinity
  }

  expect(flatten(c.values).every(v => v < 1)).toBe(true)
})

test("throws an error when attempting to preprocess non-DataFrames", () => {
  expect(() => {
    preprocess()
  }).toThrow()

  expect(() => {
    preprocess(normal([1000, 5]))
  }).toThrow()

  expect(() => {
    preprocess(new DataFrame())
  }).toThrow()

  expect(() => {
    preprocess(123)
  }).toThrow()

  expect(() => {
    preprocess("foo")
  }).toThrow()

  expect(() => {
    preprocess(true)
  }).toThrow()

  expect(() => {
    preprocess(false)
  }).toThrow()

  expect(() => {
    preprocess(null)
  }).toThrow()

  expect(() => {
    preprocess(undefined)
  }).toThrow()

  expect(() => {
    preprocess(() => {})
  }).toThrow()

  expect(() => {
    preprocess({})
  }).toThrow()
})

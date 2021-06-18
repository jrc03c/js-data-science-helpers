const sortCorrelationMatrix = require("./sort-correlation-matrix.js")
const getCorrelationMatrix = require("./get-correlation-matrix.js")
const getMagnitude = require("./get-magnitude.js")
const { DataFrame, normal, max, int, random, sort } = require("js-math-tools")

test("sorts a random correlation matrix", () => {
  const x = normal([100, 25])
  const c = new DataFrame(getCorrelationMatrix(x))
  c.index = c.columns
  const s = sortCorrelationMatrix(c)
  const m2 = getMagnitude(s.values[s.values.length - 1])

  expect(sort(s.columns)).toStrictEqual(sort(c.columns))
  expect(sort(s.index)).toStrictEqual(sort(c.index))
  expect(s.shape).toStrictEqual(c.shape)

  s.values.forEach((row, i) => {
    const m1 = getMagnitude(row)
    expect(m2).toBeGreaterThanOrEqual(m1)

    if (i > 0) {
      const subrow = row.slice(0, i)
      expect(max(subrow)).toBe(subrow[subrow.length - 1])
    }
  })
})

test("sorts a random correlation matrix that has missing values", () => {
  const x = normal([100, 25])

  for (let i = 0; i < 0.1 * 100 * 25; i++) {
    const row = int(random() * x.length)
    const col = int(random() * x[row].length)
    x[row][col] = null
  }

  const c = new DataFrame(getCorrelationMatrix(x))
  c.index = c.columns
  const s = sortCorrelationMatrix(c)
  const m2 = getMagnitude(s.values[s.values.length - 1])

  expect(sort(s.columns)).toStrictEqual(sort(c.columns))
  expect(sort(s.index)).toStrictEqual(sort(c.index))
  expect(s.shape).toStrictEqual(c.shape)

  s.values.forEach((row, i) => {
    const m1 = getMagnitude(row)
    expect(m2).toBeGreaterThanOrEqual(m1)

    if (i > 0) {
      const subrow = row.slice(0, i)
      expect(max(subrow)).toBe(subrow[subrow.length - 1])
    }
  })
})

test("throws an error when attempting to sort a non-correlation-matrix", () => {
  expect(() => {
    sortCorrelationMatrix()
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix([])
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(new DataFrame([]))
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(new DataFrame(normal([5, 5])))
  }).toThrow()

  expect(() => {
    const c = new DataFrame(normal([5, 5]))
    c.index = c.columns
    sortCorrelationMatrix(c)
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(123)
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix("foo")
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(true)
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(false)
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(null)
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(undefined)
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix(() => {})
  }).toThrow()

  expect(() => {
    sortCorrelationMatrix({})
  }).toThrow()
})

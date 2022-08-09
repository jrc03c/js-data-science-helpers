const {
  chop,
  DataFrame,
  distance,
  identity,
  isDataFrame,
  normal,
  ones,
  round,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

const getCorrelationMatrix = require("./get-correlation-matrix.js")
const gramSchmidtOrthonormalize = require("./gram-schmidt-orthonormalize.js")

test("gets a correlation matrix from a matrix containing identical columns", () => {
  const row = normal(100)
  const x = transpose([row, row, row])
  const yTrue = ones([3, 3])
  const yPred = getCorrelationMatrix(x)
  expect(distance(yPred, yTrue)).toBeLessThan(1e-5)
})

test("gets a correlation matrix from an orthonormalized matrix", () => {
  const x = gramSchmidtOrthonormalize(normal([1000, 5]))
  const yTrue = identity(5)
  const yPred = chop(round(getCorrelationMatrix(x)))
  expect(distance(yPred, yTrue)).toBeLessThan(1e-5)
})

test("gets a correlation matrix from two matrices", () => {
  const a = normal([100, 5])
  const b = normal([100, 10])
  const yPred = getCorrelationMatrix(a, b)
  expect(shape(yPred)).toStrictEqual([5, 10])
})

test("gets correlation matrices using DataFrames", () => {
  const a = new DataFrame(normal([25, 8]))
  a.columns = a.columns.map((v, i) => "a" + i)

  const b = new DataFrame(normal([25, 10]))
  b.columns = b.columns.map((v, i) => "b" + i)

  const c = getCorrelationMatrix(a, b)
  expect(isDataFrame(c)).toBe(true)
  expect(shape(c)).toStrictEqual([8, 10])
  expect(c.index).toStrictEqual(a.columns)
  expect(c.columns).toStrictEqual(b.columns)

  const d = normal([25, 4])
  const e = getCorrelationMatrix(a, d)
  const f = getCorrelationMatrix(d, b)
  expect(isDataFrame(e)).toBe(true)
  expect(shape(e)).toStrictEqual([8, 4])
  expect(e.index).toStrictEqual(a.columns)
  expect(e.columns).toStrictEqual(e.columns.map((v, i) => "col" + i))
  expect(isDataFrame(f)).toBe(true)
  expect(shape(f)).toStrictEqual([4, 10])
  expect(f.index).toStrictEqual(f.index.map((v, i) => "col" + i))
  expect(f.columns).toStrictEqual(b.columns)
})

test("throws an error when attempting to get correlation matrices from non-matrices", () => {
  expect(() => {
    getCorrelationMatrix()
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(normal([5, 5, 5, 5]))
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(123)
  }).toThrow()

  expect(() => {
    getCorrelationMatrix("foo")
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(true)
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(false)
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(null)
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(undefined)
  }).toThrow()

  expect(() => {
    getCorrelationMatrix(() => {})
  }).toThrow()

  expect(() => {
    getCorrelationMatrix({})
  }).toThrow()
})

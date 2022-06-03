const getCorrelationMatrix = require("./get-correlation-matrix.js")
const gramSchmidtOrthonormalize = require("./gram-schmidt-orthonormalize.js")

const {
  chop,
  distance,
  identity,
  normal,
  ones,
  round,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

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

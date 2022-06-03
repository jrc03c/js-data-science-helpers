const getPValueMatrix = require("./get-p-value-matrix.js")

const {
  add,
  chop,
  distance,
  identity,
  normal,
  ones,
  round,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

test("gets a p-value matrix from a matrix containing identical columns", () => {
  const row = normal(100)
  const x = transpose([row, row, row])
  const yTrue = ones([3, 3])
  const yPred = getPValueMatrix(x)
  expect(distance(yPred, yTrue)).toBeLessThan(1e-5)
})

test("gets a p-value matrix from a matrix with completely different columns", () => {
  const x = transpose([
    add(-1000, normal(1000)),
    normal(1000),
    add(1000, normal(1000)),
  ])

  const yTrue = identity(3)
  const yPred = chop(round(getPValueMatrix(x)))
  expect(distance(yPred, yTrue)).toBeLessThan(1e-5)
})

test("gets a p-value matrix from two matrices", () => {
  const a = normal([100, 5])
  const b = normal([100, 10])
  const yPred = getPValueMatrix(a, b)
  expect(shape(yPred)).toStrictEqual([5, 10])
})

test("throws an error when attempting to get p-value matrices from non-matrices", () => {
  expect(() => {
    getPValueMatrix()
  }).toThrow()

  expect(() => {
    getPValueMatrix(normal([5, 5, 5, 5]))
  }).toThrow()

  expect(() => {
    getPValueMatrix(123)
  }).toThrow()

  expect(() => {
    getPValueMatrix("foo")
  }).toThrow()

  expect(() => {
    getPValueMatrix(true)
  }).toThrow()

  expect(() => {
    getPValueMatrix(false)
  }).toThrow()

  expect(() => {
    getPValueMatrix(null)
  }).toThrow()

  expect(() => {
    getPValueMatrix(undefined)
  }).toThrow()

  expect(() => {
    getPValueMatrix(() => {})
  }).toThrow()

  expect(() => {
    getPValueMatrix({})
  }).toThrow()
})

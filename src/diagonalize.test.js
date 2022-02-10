const diagonalize = require("./diagonalize.js")
const { sort, set, shape, normal, flatten } = require("@jrc03c/js-math-tools")

test("diagonalizes a small vector", () => {
  const x = [1, 2, 3]

  const yTrue = [
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 3],
  ]

  const yPred = diagonalize(x)
  expect(yPred).toStrictEqual(yTrue)
})

test("diagonalizes a large vector", () => {
  const x = normal(100)
  const yPred = diagonalize(x)
  expect(shape(yPred)).toStrictEqual([100, 100])
  expect(sort(set(flatten(yPred)))).toStrictEqual(sort(set(x.concat([0]))))
})

test("throws an error when attempting to diagonalize non-vectors", () => {
  expect(() => {
    diagonalize()
  }).toThrow()

  expect(() => {
    diagonalize(normal([5, 5, 5]))
  }).toThrow()

  expect(() => {
    diagonalize(123)
  }).toThrow()

  expect(() => {
    diagonalize("foo")
  }).toThrow()

  expect(() => {
    diagonalize(true)
  }).toThrow()

  expect(() => {
    diagonalize(false)
  }).toThrow()

  expect(() => {
    diagonalize(null)
  }).toThrow()

  expect(() => {
    diagonalize(undefined)
  }).toThrow()

  expect(() => {
    diagonalize(() => {})
  }).toThrow()

  expect(() => {
    diagonalize({})
  }).toThrow()
})

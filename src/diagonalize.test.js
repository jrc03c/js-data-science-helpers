const {
  flatten,
  isDataFrame,
  normal,
  Series,
  set,
  shape,
  sort,
} = require("@jrc03c/js-math-tools")
const diagonalize = require("./diagonalize.js")

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

test("diagonalizes a Series", () => {
  const s = new Series([2, 3, 4])
  const t = diagonalize(s)
  expect(isDataFrame(t)).toBe(true)
  expect(t.shape).toStrictEqual([3, 3])
  expect(t.index).toStrictEqual(s.index)
  expect(t.columns).toStrictEqual(s.index)

  expect(t.values).toStrictEqual([
    [2, 0, 0],
    [0, 3, 0],
    [0, 0, 4],
  ])
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

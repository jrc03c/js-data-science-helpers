const rScore = require("./r-score.js")
const { normal, add, scale, ones } = require("@jrc03c/js-math-tools")

test("gets the r-score of various arrays", () => {
  const a = normal(1000)
  expect(rScore(a, a)).toBe(1)

  const b = add(a, scale(0.01, normal(1000)))
  expect(rScore(a, b)).toBeGreaterThan(0.95)

  const c = normal(1000)
  expect(rScore(a, c)).toBeLessThanOrEqual(0)

  const d = normal([5, 10, 15])
  const e = add(d, scale(0.01, normal([5, 10, 15])))
  expect(rScore(d, e)).toBeGreaterThan(0.95)

  const xTrue = ones([10, 10, 10])
  const xPred = normal([10, 10, 10])
  expect(rScore(xTrue, xPred)).toBe(0)
})

test("throw an error when attempting to get the r-score of non-numerical non-arrays", () => {
  expect(() => {
    rScore()
  }).toThrow()

  expect(() => {
    rScore([], [])
  }).toThrow()

  expect(() => {
    rScore([1, 2, "three"], ["four", 5, 6])
  }).toThrow()

  expect(() => {
    rScore(normal([2, 3, 4]), normal([3, 4, 5]))
  }).toThrow()

  expect(() => {
    rScore(123, 456)
  }).toThrow()

  expect(() => {
    rScore(true, false)
  }).toThrow()

  expect(() => {
    rScore("foo", "bar")
  }).toThrow()

  expect(() => {
    rScore(null, undefined)
  }).toThrow()

  expect(() => {
    rScore(() => {}, {})
  }).toThrow()
})

const pValue = require("./p-value.js")
const { normal, scale, add } = require("@jrc03c/js-math-tools")

test("gets a p-value for pairs of vectors", () => {
  const a = normal(1000)
  expect(pValue(a, a)).toBe(1)

  const b = add(a, scale(0.01, normal(1000)))
  expect(pValue(a, b)).toBeGreaterThan(0.95)

  const c = add(a, 1000)
  expect(pValue(a, c)).toBeLessThan(0.05)
})

test("throw an error when attempting to get a p-value using non-vectors", () => {
  expect(() => {
    pValue()
  }).toThrow()

  expect(() => {
    pValue([], [])
  }).toThrow()

  expect(() => {
    pValue(normal([5, 5]), normal([5, 5]))
  }).toThrow()

  expect(() => {
    pValue([1, 2, "three"], ["four", 5, 6])
  }).not.toThrow()

  expect(() => {
    pValue(123, 456)
  }).toThrow()

  expect(() => {
    pValue("foo", "bar")
  }).toThrow()

  expect(() => {
    pValue(true, false)
  }).toThrow()

  expect(() => {
    pValue(null, undefined)
  }).toThrow()

  expect(() => {
    pValue(() => {}, {})
  }).toThrow()
})

const { normal } = require("@jrc03c/js-math-tools")
const containsOnlyNumbers = require("./contains-only-numbers.js")

test("checks if various arrays contain only numbers", () => {
  const a = [1, 2, 3, 4, 5]
  expect(containsOnlyNumbers(a)).toBe(true)

  const b = [1, 2, 3, 4, 0]
  expect(containsOnlyNumbers(b)).toBe(true)

  const c = [1, "two", 3, 4, 5]
  expect(containsOnlyNumbers(c)).toBe(false)

  const d = normal([5, 5, 5])
  expect(containsOnlyNumbers(d)).toBe(true)

  d[1][2][3] = null
  expect(containsOnlyNumbers(d)).toBe(false)

  d[1][2][3] = undefined
  expect(containsOnlyNumbers(d)).toBe(false)

  d[1][2][3] = true
  expect(containsOnlyNumbers(d)).toBe(false)

  d[1][2][3] = false
  expect(containsOnlyNumbers(d)).toBe(false)

  d[1][2][3] = Infinity
  expect(containsOnlyNumbers(d)).toBe(true)

  d[1][2][3] = Math.PI
  expect(containsOnlyNumbers(d)).toBe(true)

  d[1][2][3] = () => {}
  expect(containsOnlyNumbers(d)).toBe(false)

  d[1][2][3] = {}
  expect(containsOnlyNumbers(d)).toBe(false)
})

test("throws an error when attempting to call `containsOnlyNumbers` with non-arrays", () => {
  expect(() => {
    containsOnlyNumbers()
  }).toThrow()

  expect(() => {
    containsOnlyNumbers(123)
  }).toThrow()

  expect(() => {
    containsOnlyNumbers("foo")
  }).toThrow()

  expect(() => {
    containsOnlyNumbers(true)
  }).toThrow()

  expect(() => {
    containsOnlyNumbers(false)
  }).toThrow()

  expect(() => {
    containsOnlyNumbers(() => {})
  }).toThrow()

  expect(() => {
    containsOnlyNumbers({})
  }).toThrow()

  expect(() => {
    containsOnlyNumbers(undefined)
  }).toThrow()

  expect(() => {
    containsOnlyNumbers(null)
  }).toThrow()
})

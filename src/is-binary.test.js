const isBinary = require("./is-binary.js")
const {
  random,
  round,
  identity,
  zeros,
  ones,
  normal,
} = require("@jrc03c/js-math-tools")

test("checks whether various things are binary", () => {
  expect(isBinary(0)).toBe(true)
  expect(isBinary(1)).toBe(true)
  expect(isBinary([0])).toBe(true)
  expect(isBinary([1])).toBe(true)
  expect(isBinary([0, 1])).toBe(true)
  expect(isBinary([1, 0])).toBe(true)
  expect(isBinary(zeros(1000))).toBe(true)
  expect(isBinary(ones(1000))).toBe(true)
  expect(isBinary(zeros(100).concat(ones(100)))).toBe(true)
  expect(isBinary(identity(100))).toBe(true)
  expect(isBinary(normal([5, 5, 5]))).toBe(false)
  expect(isBinary(123)).toBe(false)
  expect(isBinary("foo")).toBe(false)
  expect(isBinary(true)).toBe(false)
  expect(isBinary(false)).toBe(false)
  expect(isBinary(undefined)).toBe(false)
  expect(isBinary(null)).toBe(false)
  expect(isBinary(() => {})).toBe(false)
  expect(isBinary({})).toBe(false)
})

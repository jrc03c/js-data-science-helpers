const getMagnitude = require("./get-magnitude.js")
const { zeros, ones, scale, pow, normal } = require("@jrc03c/js-math-tools")
const divide = (a, b) => scale(a, pow(b, -1))

test("gets the magnitudes of various arrays", () => {
  expect(getMagnitude([3])).toBe(3)
  expect(getMagnitude([3, 4])).toBe(5)
  expect(getMagnitude([3, 4, 5])).toBe(Math.sqrt(50))
  expect(getMagnitude(zeros([5, 5, 5]))).toBe(0)
  expect(getMagnitude(ones([5, 5, 5]))).toBe(Math.sqrt(125))
  expect(getMagnitude(scale(2, ones([5, 5, 5])))).toBe(Math.sqrt(125 * 4))

  const x = normal([5, 5, 5, 5])
  const m = getMagnitude(x)
  expect(Math.abs(getMagnitude(divide(x, m)) - 1)).toBeLessThan(1e-5)
})

test("throws an error when attempting to get the magnitude of non-arrays", () => {
  expect(() => {
    getMagnitude()
  }).toThrow()

  expect(() => {
    getMagnitude([])
  }).toThrow()

  expect(() => {
    getMagnitude(123)
  }).toThrow()

  expect(() => {
    getMagnitude("foo")
  }).toThrow()

  expect(() => {
    getMagnitude(true)
  }).toThrow()

  expect(() => {
    getMagnitude(false)
  }).toThrow()

  expect(() => {
    getMagnitude(null)
  }).toThrow()

  expect(() => {
    getMagnitude(undefined)
  }).toThrow()

  expect(() => {
    getMagnitude(() => {})
  }).toThrow()

  expect(() => {
    getMagnitude({})
  }).toThrow()
})

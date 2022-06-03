const getMagnitude = require("./get-magnitude.js")
const project = require("./project.js")

const divide = (a, b) => scale(a, pow(b, -1))
const normalize = x => divide(x, getMagnitude(x))
const similarity = (a, b) => dot(a, b) / (getMagnitude(a) * getMagnitude(b))

const {
  abs,
  distance,
  dot,
  normal,
  pow,
  random,
  scale,
} = require("@jrc03c/js-math-tools")

test("projects a small vector onto another", () => {
  const a = [3, 4]
  const b = [10, 0]
  const yTrue = [3, 0]
  const yPred = project(a, b)
  expect(yPred).toStrictEqual(yTrue)
})

test("projects a large vector onto another", () => {
  const a = normal(1000)
  const b = random(1000)
  const yPred = project(a, b)
  const s = similarity(yPred, b)

  if (s < 0) {
    expect(abs(s + 1)).toBeLessThan(1e-5)
  } else {
    expect(abs(s - 1)).toBeLessThan(1e-5)
  }

  expect(distance(abs(normalize(yPred)), abs(normalize(b)))).toBeLessThan(1e-5)
})

test("throws an error when attempting to project non-vectors onto non-vectors", () => {
  expect(() => {
    project()
  }).toThrow()

  expect(() => {
    project([], [])
  }).toThrow()

  expect(() => {
    project([1, 2, "three"], ["four", 5, 6])
  }).toThrow()

  expect(() => {
    project(normal([5, 5, 5]), normal([5, 5, 5]))
  }).toThrow()

  expect(() => {
    project(123, 456)
  }).toThrow()

  expect(() => {
    project("foo", "bar")
  }).toThrow()

  expect(() => {
    project(true, false)
  }).toThrow()

  expect(() => {
    project(undefined, null)
  }).toThrow()

  expect(() => {
    project(() => {}, {})
  }).toThrow()
})

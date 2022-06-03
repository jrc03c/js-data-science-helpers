const getCorrelationMatrix = require("./get-correlation-matrix.js")
const gramSchmidtOrthonormalize = require("./gram-schmidt-orthonormalize.js")

const {
  abs,
  add,
  chop,
  correl,
  distance,
  identity,
  normal,
  round,
  scale,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

test("orthonormalizes some closely related vectors", () => {
  const a = normal(10000)
  const b = add(a, scale(0.01, normal(shape(a))))
  const x = transpose([a, b])
  const yPred = transpose(gramSchmidtOrthonormalize(x))
  expect(correl(a, b)).toBeGreaterThan(0.999)
  expect(abs(correl(yPred[0], yPred[1]))).toBeLessThan(0.001)
})

test("orthonormalizes a matrix", () => {
  const x = normal([1000, 5])
  const xn = gramSchmidtOrthonormalize(x)
  const yPred = chop(round(getCorrelationMatrix(xn)))
  const yTrue = identity(5)
  expect(distance(yPred, yTrue)).toBeLessThan(1e-5)
})

test("throws an error when attempting to orthonormalize non-matrices", () => {
  expect(() => {
    gramSchmidtOrthonormalize()
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize([1, 2, 3])
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(normal([5, 5, 5, 5]))
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(123)
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize("foo")
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(true)
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(false)
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(null)
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(undefined)
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize(() => {})
  }).toThrow()

  expect(() => {
    gramSchmidtOrthonormalize({})
  }).toThrow()
})

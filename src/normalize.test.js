const normalize = require("./normalize.js")

const {
  abs,
  add,
  DataFrame,
  mean,
  normal,
  random,
  range,
  round,
  scale,
  std,
} = require("@jrc03c/js-math-tools")

test("normalizes an already-normalized vector", () => {
  const x = normalize(normal(1000))
  expect(abs(mean(x))).toBeLessThan(1e-5)
  expect(abs(std(x) - 1)).toBeLessThan(1e-5)
})

test("normalizes a vector", () => {
  const x = normalize(scale(add(random(1000), -100), 50))
  expect(abs(mean(x))).toBeLessThan(1e-5)
  expect(abs(std(x) - 1)).toBeLessThan(1e-5)
})

test("normalizes a vector with only 1 unique value", () => {
  const x = range(0, 1000).map(i => 5)
  const yPred = normalize(x)
  expect(yPred).toStrictEqual(x)
})

test("normalizes each column in a DataFrame", () => {
  let x = new DataFrame({
    a: range(0, 1000),
    b: random(1000),
    c: normal(1000),
    d: round(random(1000)),
  })

  x = x.apply(col => normalize(col.values))

  x.columns.forEach(col => {
    const values = x.get(null, col).values
    expect(abs(mean(values))).toBeLessThan(1e-5)
    expect(abs(std(values) - 1)).toBeLessThan(1e-5)
  })
})

test("throws an error when attempting to normalize non-vectors", () => {
  expect(() => {
    normalize()
  }).toThrow()

  expect(() => {
    normalize([])
  }).not.toThrow()

  expect(() => {
    normalize([1, 2, "three", 4, 5])
  }).not.toThrow()

  expect(() => {
    normalize(normal([5, 5, 5]))
  }).toThrow()

  expect(() => {
    normalize(123)
  }).toThrow()

  expect(() => {
    normalize("foo")
  }).toThrow()

  expect(() => {
    normalize(true)
  }).toThrow()

  expect(() => {
    normalize(false)
  }).toThrow()

  expect(() => {
    normalize(null)
  }).toThrow()

  expect(() => {
    normalize(undefined)
  }).toThrow()

  expect(() => {
    normalize(() => {})
  }).toThrow()

  expect(() => {
    normalize({})
  }).toThrow()
})

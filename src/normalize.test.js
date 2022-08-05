const normalize = require("./normalize.js")

const {
  abs,
  add,
  DataFrame,
  dropNaN,
  mean,
  normal,
  random,
  range,
  round,
  scale,
  Series,
  shape,
  std,
  transpose,
} = require("@jrc03c/js-math-tools")

test("normalizes an empty array", () => {
  expect(normalize([])).toStrictEqual([])
})

test("normalizes a vector with NaN values", () => {
  const x = [1, 2, "three", 4, 5]
  const y = normalize(x)

  expect(y.length).toBe(x.length)
  expect(y[2]).toBe(x[2])
  expect(abs(mean(dropNaN(y)))).toBeLessThan(1e-5)
  expect(abs(std(dropNaN(y)) - 1)).toBeLessThan(1e-5)
})

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
  const x = range(0, 1000).map(() => 5)
  const yPred = normalize(x)
  expect(yPred).toStrictEqual(x)
})

test("normalizes a matrix", () => {
  const x = normal([100, 10])
  const y = normalize(x)

  expect(y).not.toStrictEqual(x)
  expect(shape(y)).toStrictEqual(shape(x))

  transpose(y).forEach(col => {
    expect(abs(mean(col))).toBeLessThan(1e-5)
    expect(abs(std(col) - 1)).toBeLessThan(1e-5)
  })
})

test("normalizes each column in a DataFrame one-at-a-time", () => {
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

test("normalizes a Series", () => {
  const x = new Series(random(1000))
  const y = normalize(x)
  expect(y instanceof Series).toBe(true)
  expect(y.name).toBe(x.name)
  expect(y.index).toStrictEqual(x.index)
  expect(y.values.length).toBe(x.values.length)
  expect(abs(mean(y.values))).toBeLessThan(1e-5)
  expect(abs(std(y.values) - 1)).toBeLessThan(1e-5)
})

test("normalizes a DataFrame", () => {
  const x = new DataFrame(random([100, 5]))
  const y = normalize(x)
  expect(y instanceof DataFrame).toBe(true)
  expect(y.index).toStrictEqual(x.index)
  expect(y.columns).toStrictEqual(x.columns)
  expect(shape(y.values)).toStrictEqual(shape(x.values))

  transpose(y.values).forEach(col => {
    expect(abs(mean(col))).toBeLessThan(1e-5)
    expect(abs(std(col) - 1)).toBeLessThan(1e-5)
  })
})

test("throws an error when attempting to normalize inappropriate values", () => {
  const wrongs = [
    normal([5, 5, 5]),
    [
      [2, 3],
      [4, 5, 6],
      [7, 8, 9, 10],
    ],
    123,
    "foo",
    true,
    false,
    null,
    undefined,
    {},
  ]

  wrongs.forEach(item => {
    expect(() => {
      normalize(item)
    }).toThrow()
  })
})

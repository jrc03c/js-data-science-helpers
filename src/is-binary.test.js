const {
  DataFrame,
  identity,
  ones,
  random,
  round,
  Series,
  zeros,
} = require("@jrc03c/js-math-tools")

const isBinary = require("./is-binary")

test("tests that arrays, Series, and DataFrames can be correctly identified as binary", () => {
  expect(isBinary(0)).toBe(true)
  expect(isBinary(1)).toBe(true)
  expect(isBinary(-1)).toBe(false)
  expect(isBinary([])).toBe(false)
  expect(isBinary([0])).toBe(true)
  expect(isBinary([1])).toBe(true)
  expect(isBinary(round(random(100)))).toBe(true)
  expect(isBinary(round(random([2, 3, 4, 5])))).toBe(true)
  expect(isBinary(random(100))).toBe(false)
  expect(isBinary(new Series(round(random(100))))).toBe(true)
  expect(isBinary(new DataFrame(round(random([100, 5]))))).toBe(true)
  expect(isBinary(new Series(random(100)))).toBe(false)
  expect(isBinary(new DataFrame(random([100, 5])))).toBe(false)
  expect(isBinary(random(100).map(v => round(v * 2 - 1)))).toBe(false)
  expect(isBinary(zeros([2, 3, 4, 5]))).toBe(true)
  expect(isBinary(ones([2, 3, 4, 5]))).toBe(true)
  expect(isBinary(identity(10))).toBe(true)

  const wrongs = [
    2.3,
    -2.3,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
  ]

  wrongs.forEach(item => {
    expect(isBinary(item)).toBe(false)
  })
})

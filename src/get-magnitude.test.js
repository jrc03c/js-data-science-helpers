const { DataFrame, flatten, normal, Series } = require("@jrc03c/js-math-tools")
const common = require("./common")
const getMagnitude = require("./get-magnitude")

test("tests that the magnitudes of various arrays, Series, and DataFrames can be correctly computed", () => {
  expect(getMagnitude([3])).toBe(3)
  expect(getMagnitude([3, 4])).toBe(5)
  expect(getMagnitude([10, 24])).toBe(26)

  const a = normal(100)
  expect(getMagnitude(a)).toBe(Math.sqrt(a.reduce((a, b) => a + b * b, 0)))

  const b = normal([2, 3, 4, 5])

  expect(getMagnitude(b)).toBe(
    Math.sqrt(flatten(b).reduce((a, b) => a + b * b, 0))
  )

  const c = new Series({ hello: normal(100) })
  expect(getMagnitude(c)).toBe(getMagnitude(c.values))

  const d = new DataFrame({ foo: normal(100), bar: normal(100) })
  expect(getMagnitude(d)).toBe(getMagnitude(d.values))

  common.shouldIgnoreNaNValues = false
  expect(getMagnitude([3, 4, "five"])).toBeNaN()
  common.shouldIgnoreNaNValues = true
  expect(getMagnitude([3, 4, "five"])).toBe(5)

  const wrongs = [
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
  ]

  wrongs.forEach(item => {
    expect(getMagnitude(item)).toBeNaN()
  })
})

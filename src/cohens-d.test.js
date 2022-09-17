const { DataFrame, normal, Series } = require("@jrc03c/js-math-tools")
const cohensd = require("./cohens-d.js")
const common = require("./common.js")

test("tests that Cohen's D can be correctly calculated", () => {
  const a = normal(100)
  expect(cohensd(a, a)).toBe(0)

  const b = normal(10000)
  const c = normal(10000)
  expect(Math.abs(cohensd(b, c))).toBeLessThan(0.1)

  const d = new Series(normal(100))
  const e = new Series(normal(100).map(v => v + 110))
  expect(Math.abs(cohensd(d, e))).toBeGreaterThan(100)

  common.shouldIgnoreNaNValues = false
  const f = [2, 3, 4]
  const g = [5, 6, "seven"]
  expect(cohensd(f, g)).toBeNaN()
  common.shouldIgnoreNaNValues = true
  expect(cohensd(f, g)).not.toBeNaN()

  const wrongs = [
    0,
    1,
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
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
  ]

  wrongs.forEach(a => {
    wrongs.forEach(b => {
      expect(() => cohensd(a, b)).toThrow()
    })
  })
})

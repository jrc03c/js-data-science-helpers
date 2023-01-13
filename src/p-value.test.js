const { DataFrame, normal, Series } = require("@jrc03c/js-math-tools")
const pValue = require("./p-value")

test("tests that p-values can be correctly computed", () => {
  const a = normal(100)
  expect(pValue(a, a)).toBe(1)

  const b = normal(100)
  const c = normal(100).map(v => v + 100)
  expect(pValue(b, c)).toBeLessThan(0.01)

  const d = normal([2, 3, 4, 5])
  const e = normal([2, 3, 4, 5])
  expect(() => pValue(d, e)).not.toThrow()

  const f = new Series({ hello: normal(100) })
  const g = new Series({ goodbye: normal(100) })
  expect(() => pValue(f, g)).not.toThrow()

  const h = new DataFrame({ foo: normal(100), bar: normal(100) })
  const i = new DataFrame({ baz: normal(100), aha: normal(100) })
  expect(() => pValue(h, i)).not.toThrow()

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
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
  ]

  wrongs.forEach(a => {
    wrongs.forEach(b => {
      expect(() => pValue(a, b)).toThrow()
    })
  })
})

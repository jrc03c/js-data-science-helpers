const { copy, DataFrame, normal, Series } = require("@jrc03c/js-math-tools")
const getCorrelationMatrix = require("./get-correlation-matrix")
const isCorrelationMatrix = require("./is-correlation-matrix")

test("tests that correlation matrices can be correctly identified", () => {
  const a = normal([100, 5])
  const b = normal([100, 7])
  const c = getCorrelationMatrix(a, b)
  const d = copy(c)
  expect(isCorrelationMatrix(c)).toBe(true)
  expect(isCorrelationMatrix(d)).toBe(false)

  const e = new DataFrame(normal([100, 5]))
  const f = new DataFrame(normal([100, 7]))
  const g = getCorrelationMatrix(e, f)
  const h = g.copy()
  expect(isCorrelationMatrix(g)).toBe(true)
  expect(isCorrelationMatrix(h)).toBe(false)

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
    expect(isCorrelationMatrix(item)).toBe(false)
  })
})

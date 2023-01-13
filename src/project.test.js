const {
  DataFrame,
  dot,
  isEqual,
  normal,
  scale,
  Series,
} = require("@jrc03c/js-math-tools")

const project = require("./project")

test("tests that vectors can be correctly projected onto other vectors", () => {
  const a = [4, 3]
  const b = [1, 0]
  const cTrue = [4, 0]
  const cPred = project(a, b)
  expect(isEqual(cPred, cTrue)).toBe(true)

  const d = normal(100)
  const e = normal(100)
  const fTrue = scale(dot(d, e) / dot(e, e), e)
  const fPred = project(d, e)
  expect(isEqual(fPred, fTrue)).toBe(true)

  const g = new Series({ hello: normal(100) })
  const h = new Series({ goodbye: normal(100) })
  const iTrue = new Series(project(g.values, h.values))
  const iPred = project(g, h)
  expect(isEqual(iPred, iTrue)).toBe(true)

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
      expect(() => project(a, b)).toThrow()
    })
  })
})

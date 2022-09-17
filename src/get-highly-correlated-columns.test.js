const {
  add,
  DataFrame,
  isEqual,
  normal,
  range,
  scale,
  Series,
  transpose,
} = require("@jrc03c/js-math-tools")

const common = require("./common.js")
const getHighlyCorrelatedColumns = require("./get-highly-correlated-columns.js")
const orthonormalize = require("./orthonormalize.js")

test("tests that highly correlated columns in matrices can be correctly identified", () => {
  const a = normal(100)
  const b = new DataFrame({ foo: a, bar: a, baz: a })

  const cTrue = {
    foo: ["bar", "baz", "foo"],
    bar: ["bar", "baz", "foo"],
    baz: ["bar", "baz", "foo"],
  }

  const cPred = getHighlyCorrelatedColumns(b)
  expect(isEqual(cPred, cTrue)).toBe(true)

  const d = normal(100)

  const e = new DataFrame({
    d1: d,
    d2: add(d, scale(1e-5, normal(100))),
    d3: add(d, normal(100)),
    d4: add(d, scale(1e5, normal(100))),
  })

  const fTrue = { d1: ["d1", "d2"], d2: ["d1", "d2"], d3: ["d3"], d4: ["d4"] }
  const fPred = getHighlyCorrelatedColumns(e)
  expect(isEqual(fPred, fTrue)).toBe(true)

  const g = new DataFrame(normal([100, 5]))
  const h = new DataFrame(normal([100, 7]))

  expect(
    isEqual(
      getHighlyCorrelatedColumns(g, h),
      getHighlyCorrelatedColumns(g.values, h.values)
    )
  ).toBe(true)

  const i = new DataFrame(orthonormalize(normal([100, 10])))
  const jTrue = {}
  i.columns.forEach(c => (jTrue[c] = [c]))
  const jPred = getHighlyCorrelatedColumns(i)
  expect(isEqual(jPred, jTrue)).toBe(true)

  const k = normal(100)

  const l = new DataFrame(
    transpose(range(0, 5).map(() => add(k, scale(1e-20, normal(100)))))
  )

  common.shouldIgnoreNaNValues = false
  const mTrue = getHighlyCorrelatedColumns(l)

  l.values[parseInt(Math.random() * l.shape[0])][
    parseInt(Math.random() * l.shape[1])
  ] = "uh-oh"

  const mPred1 = getHighlyCorrelatedColumns(l)
  expect(isEqual(mPred1, mTrue)).toBe(false)

  common.shouldIgnoreNaNValues = true
  const mPred2 = getHighlyCorrelatedColumns(l)
  expect(isEqual(mPred2, mTrue)).toBe(true)

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
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new Series({ hello: [10, 20, 30, 40, 50] }),
  ]

  wrongs.forEach(a => {
    wrongs.forEach(b => {
      expect(() => getHighlyCorrelatedColumns(a, b)).toThrow()
    })
  })
})

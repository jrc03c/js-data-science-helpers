const {
  DataFrame,
  isEqual,
  isUndefined,
  range,
  normal,
  Series,
} = require("@jrc03c/js-math-tools")

const IndexMatcher = require("./index-matcher.js")

test("tests that indices in Series and DataFrames can be correctly matched after dropping missing and/or NaN values", () => {
  const a = new Series({ hello: [2, 3, null, 4] })
  const bTrue = a.get([0, 1, 3], null)
  const bPred = new IndexMatcher().fitAndTransform(a)
  expect(isEqual(bPred, bTrue)).toBe(true)

  const c = new Series({
    hello: normal(100).map(v => (Math.random() < 0.05 ? null : v)),
  })

  const d = new Series({
    goodbye: normal(100).map(v => (Math.random() < 0.05 ? null : v)),
  })

  const eTrue = [
    c.filter((v, i) => !isUndefined(v) && !isUndefined(d.values[i])),
    d.filter((v, i) => !isUndefined(v) && !isUndefined(c.values[i])),
  ]

  const ePred = new IndexMatcher().fitAndTransform(c, d)
  expect(isEqual(ePred, eTrue)).toBe(true)

  const f = new DataFrame({
    foo: normal(100).map(v => (Math.random() < 0.1 ? "yes" : v)),
    bar: normal(100).map(v => (Math.random() < 0.1 ? "no" : v)),
  })

  const g = new DataFrame({
    baz: normal(100).map(v => (Math.random() < 0.1 ? "hi" : v)),
    goodbye: normal(100).map(v => (Math.random() < 0.1 ? "bye" : v)),
  })

  const hTrue1 = [
    f.filter(
      (row, i) =>
        row.values.every(v => !isUndefined(v)) &&
        g.values[i].every(v => !isUndefined(v))
    ),
    g.filter(
      (row, i) =>
        row.values.every(v => !isUndefined(v)) &&
        f.values[i].every(v => !isUndefined(v))
    ),
  ]

  const hPred1 = new IndexMatcher().fitAndTransform(f, g)
  expect(isEqual(hPred1, hTrue1)).toBe(true)

  const hTrue2 = [
    f.filter(
      (row, i) =>
        row.values.every(v => !isNaN(v)) && g.values[i].every(v => !isNaN(v))
    ),
    g.filter(
      (row, i) =>
        row.values.every(v => !isNaN(v)) && f.values[i].every(v => !isNaN(v))
    ),
  ]

  const hPred2 = new IndexMatcher(IndexMatcher.DROP_NAN_MODE).fitAndTransform(
    f,
    g
  )

  expect(isEqual(hPred2, hTrue2)).toBe(true)

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
  ]

  range(0, 100).forEach(() => {
    const vars = range(0, Math.random() * 10 + 5).map(
      () => wrongs[parseInt(Math.random() * wrongs.length)]
    )

    expect(() => new IndexMatcher().fitAndTransform(...vars)).toThrow()
  })
})

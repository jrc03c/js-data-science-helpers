const {
  count,
  DataFrame,
  isEqual,
  normal,
  round,
  Series,
  sort,
} = require("@jrc03c/js-math-tools")

const getPercentages = require("./get-percentages")

test("tests that percentages of values in an array can be computed correctly", () => {
  const a = [2, 3, 3, 4]

  const bTrue = [
    { value: 2, count: 1, percentage: 0.25 },
    { value: 3, count: 2, percentage: 0.5 },
    { value: 4, count: 1, percentage: 0.25 },
  ]

  const bPred = getPercentages(a)
  expect(isEqual(bPred, bTrue)).toBe(true)

  const c = round(normal([2, 3, 4, 5]))

  const dTrue = sort(
    count(c).map(v => {
      v.percentage = v.count / c.length
      return v
    }),
    (a, b) => a.value - b.value
  )

  const dPred = sort(getPercentages(c), (a, b) => a.value - b.value)
  expect(isEqual(dPred, dTrue)).toBe(true)

  const e = new Series({ hello: round(normal(100)) })
  expect(isEqual(getPercentages(e), getPercentages(e.values))).toBe(true)

  const f = new DataFrame({ foo: round(normal(100)), bar: round(normal(100)) })
  expect(isEqual(getPercentages(f), getPercentages(f.values))).toBe(true)

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

  wrongs.forEach(value => {
    expect(() => getPercentages(value)).toThrow()
  })
})

const {
  DataFrame,
  flatten,
  isEqual,
  median,
  normal,
  ones,
  random,
  range,
  reshape,
  Series,
  zeros,
} = require("@jrc03c/js-math-tools")

const clipOutliers = require("./clip-outliers.js")
const common = require("./common.js")

test("tests that outliers can be correctly clipped", () => {
  expect(isEqual(clipOutliers(zeros(100)), zeros(100))).toBe(true)
  expect(isEqual(clipOutliers(ones(100)), ones(100))).toBe(true)
  expect(isEqual(clipOutliers(range(0, 100)), range(0, 100))).toBe(true)

  expect(isEqual(clipOutliers(range(0, 10).concat([1000])), range(0, 11))).toBe(
    false
  )

  const a = [1, 2, 3, 4, 1000]
  const aMed = median(a)
  const aMad = median(a.map(v => Math.abs(v - aMed)))
  const bTrue = [1, 2, 3, 4, aMed + 5 * aMad]
  const bPred = clipOutliers(a)
  expect(isEqual(bPred, bTrue)).toBe(true)

  const c = random(1000)
  expect(isEqual(clipOutliers(c), c)).toBe(true)

  const d = reshape(
    normal(1000).map(v => (Math.random() < 0.05 ? 1e20 : v)),
    [10, 10, 10]
  )

  const dMed = median(d)
  const dMad = median(flatten(d).map(v => Math.abs(v - dMed)))

  flatten(clipOutliers(d)).forEach(v => {
    expect(v <= dMed + 5 * dMad).toBe(true)
    expect(v >= dMed - 5 * dMad).toBe(true)
  })

  const e = new Series({ hello: normal(100) })
  const fTrue = e.copy()
  fTrue.values = clipOutliers(fTrue.values)
  const fPred = clipOutliers(e)
  expect(isEqual(fPred, fTrue)).toBe(true)

  const g = new DataFrame({ foo: normal(100), bar: normal(100) })
  const hTrue = new DataFrame(clipOutliers(g.values))
  hTrue.columns = g.columns.slice()
  const hPred = clipOutliers(g)
  expect(isEqual(hPred, hTrue)).toBe(true)

  common.shouldIgnoreNaNValues = false
  const i = [2, 3, 4, 1000, "foo"]
  expect(isEqual(clipOutliers(i), [NaN, NaN, NaN, NaN, NaN])).toBe(true)
  common.shouldIgnoreNaNValues = true
  expect(isEqual(clipOutliers(i), [NaN, NaN, NaN, NaN, NaN])).not.toBe(true)

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

  wrongs.forEach(item => {
    expect(() => clipOutliers(item)).toThrow()
  })
})

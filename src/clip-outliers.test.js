const {
  clamp,
  DataFrame,
  isDataFrame,
  isEqual,
  isSeries,
  median,
  normal,
  ones,
  random,
  range,
  round,
  Series,
  shape,
  shuffle,
  sort,
  zeros,
} = require("@jrc03c/js-math-tools")

const clipOutliers = require("./clip-outliers.js")

test("attempts to clip outliers where there are none", () => {
  const x = [2, 2, 2, 3, 3, 3, 4, 4, 4]
  const y = clipOutliers(x)
  expect(y).toStrictEqual(x)
  expect(isEqual(x, y)).toBe(true)
})

test("attempts to clip outliers where there are none (v2)", () => {
  const x = clamp(normal(1000), -1, 1)
  const y = clipOutliers(x)
  expect(y).toStrictEqual(x)
  expect(isEqual(x, y)).toBe(true)
})

test("attempts to clip outliers on binary data", () => {
  const x = round(random(1000))
  const y = clipOutliers(x)
  expect(y).toStrictEqual(x)
  expect(isEqual(x, y)).toBe(true)
})

test("attempts to clip outliers when there's missing or non-numerical data", () => {
  const x = [1, 2, 3, "four"]
  const y = clipOutliers(x)
  expect(y).toStrictEqual(x)
  expect(isEqual(x, y)).toBe(true)
})

test("clips outliers", () => {
  const x = shuffle([1, 2, 3, 4, 100])
  const yTrue = [1, 2, 3, 4, 8]
  const yPred = clipOutliers(x)
  expect(sort(yPred)).toStrictEqual(yTrue)
  expect(isEqual(yPred, yTrue)).toBe(false)
})

test("attempts to clip outliers when the data is uniform", () => {
  const x = ones(1000)
  const yTrue = x
  const yPred = clipOutliers(x)
  expect(yPred).toStrictEqual(yTrue)
  expect(isEqual(yPred, yTrue)).toBe(true)
})

test("clips outliers when the outlier is the value immediately above or below the median AND the MAD == 0", () => {
  // NOTE: This was a known edge case that was not previously handled. We need
  // to make sure it's working correctly now!
  const x1 = [-1000].concat(zeros(499)).concat(ones(500))
  const y1 = clipOutliers(x1)
  expect(y1).not.toStrictEqual(x1)
  expect(isEqual(x1, y1)).toBe(false)

  const x2 = zeros(499).concat(ones(500)).concat(1000)
  const y2 = clipOutliers(x2)
  expect(y2).not.toStrictEqual(x2)
  expect(isEqual(x2, y2)).toBe(false)

  const x3 = range(0, 1000).map(() => round(normal()) + 250)
  const x3Median = median(x3)
  const outlier3 = 999999

  x3.forEach((v, i) => {
    if (v > x3Median) {
      x3[i] = outlier3
    }
  })

  const y3 = clipOutliers(x3)
  expect(y3).not.toStrictEqual(x3)
  expect(isEqual(x3, y3)).toBe(false)

  const x4 = range(0, 1000).map(() => round(normal()) + 250)
  const x4Median = median(x4)
  const outlier4 = -999999

  x4.forEach((v, i) => {
    if (v < x4Median) {
      x4[i] = outlier4
    }
  })

  const y4 = clipOutliers(x4)
  expect(y4).not.toStrictEqual(x4)
  expect(isEqual(x4, y4)).toBe(false)

  expect(() => {
    clipOutliers(normal([5, 5, 5, 5]))
  }).not.toThrow()
})

test("clips outliers in nested arrays, Series, and DataFrames", () => {
  const a = normal([2, 3, 4, 5])
  a[0][0][0][0] = 999999999
  expect(shape(clipOutliers(a, 5))).toStrictEqual([2, 3, 4, 5])

  const b = new Series(normal(100))
  b.name = "blah"
  b.index = b.index.map((v, i) => "blahRow" + i)
  b[0] = 999999999
  const c = clipOutliers(b, 5)
  expect(isSeries(c)).toBe(true)
  expect(c.length).toBe(b.length)
  expect(c.name).toBe(b.name)
  expect(c.index).toStrictEqual(b.index)

  const d = new DataFrame(normal([100, 25]))
  d.values[0][0] = 999999999
  d.columns = d.columns.map((v, i) => "dCol" + i)
  d.index = d.index.map((v, i) => "dRow" + i)
  const e = clipOutliers(d)
  expect(isDataFrame(e)).toBe(true)
  expect(e.shape).toStrictEqual(d.shape)
  expect(e.index).toStrictEqual(d.index)
  expect(e.columns).toStrictEqual(d.columns)
})

test("throws an error when attempting to clip outliers on non-vectors of non-numbers", () => {
  expect(() => {
    clipOutliers()
  }).toThrow()

  expect(() => {
    clipOutliers([1, 2, 3], "four")
  }).toThrow()

  expect(() => {
    clipOutliers(true, false)
  }).toThrow()

  expect(() => {
    clipOutliers(null, undefined)
  }).toThrow()

  expect(() => {
    clipOutliers(() => {}, {})
  }).toThrow()
})

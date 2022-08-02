const {
  clamp,
  median,
  normal,
  ones,
  random,
  range,
  round,
  shuffle,
  sort,
  zeros,
} = require("@jrc03c/js-math-tools")

const clipOutliers = require("./clip-outliers.js")

test("attempts to clip outliers where there are none", () => {
  const x = [2, 2, 2, 3, 3, 3, 4, 4, 4]
  const y = clipOutliers(x)
  expect(y.values).toStrictEqual(x)
  expect(y.wasClipped).toBe(false)
})

test("attempts to clip outliers where there are none (v2)", () => {
  const x = clamp(normal(1000), -1, 1)
  const y = clipOutliers(x)
  expect(y.values).toStrictEqual(x)
  expect(y.wasClipped).toBe(false)
})

test("attempts to clip outliers on binary data", () => {
  const x = round(random(1000))
  const y = clipOutliers(x)
  expect(y.values).toStrictEqual(x)
  expect(y.wasClipped).toBe(false)
})

test("attempts to clip outliers when there's missing or non-numerical data", () => {
  const x = [1, 2, 3, "four"]
  const y = clipOutliers(x)
  expect(y.values).toStrictEqual(x)
  expect(y.wasClipped).toBe(false)
})

test("clips outliers", () => {
  const x = shuffle([1, 2, 3, 4, 100])
  const yTrue = [1, 2, 3, 4, 8]
  const yPred = clipOutliers(x)
  expect(sort(yPred.values)).toStrictEqual(yTrue)
  expect(yPred.wasClipped).toBe(true)
})

test("attempts to clip outliers when the data is uniform", () => {
  const x = ones(1000)
  const yTrue = x
  const yPred = clipOutliers(x)
  expect(yPred.values).toStrictEqual(yTrue)
  expect(yPred.wasClipped).toBe(false)
})

test("clips outliers when the outlier is the value immediately above or below the median AND the MAD == 0", () => {
  // NOTE: This was a known edge case that was not previously handled. We need
  // to make sure it's working correctly now!
  const x1 = [-1000].concat(zeros(499)).concat(ones(500))
  const y1 = clipOutliers(x1)
  expect(y1.values).not.toStrictEqual(x1)
  expect(y1.wasClipped).toBe(true)

  const x2 = zeros(499).concat(ones(500)).concat(1000)
  const y2 = clipOutliers(x2)
  expect(y2.values).not.toStrictEqual(x2)
  expect(y2.wasClipped).toBe(true)

  const x3 = range(0, 1000).map(() => round(normal()) + 250)
  const x3Median = median(x3)
  const outlier3 = 999999

  x3.forEach((v, i) => {
    if (v > x3Median) {
      x3[i] = outlier3
    }
  })

  const y3 = clipOutliers(x3)
  expect(y3.values).not.toStrictEqual(x3)
  expect(y3.wasClipped).toBe(true)

  const x4 = range(0, 1000).map(() => round(normal()) + 250)
  const x4Median = median(x4)
  const outlier4 = -999999

  x4.forEach((v, i) => {
    if (v < x4Median) {
      x4[i] = outlier4
    }
  })

  const y4 = clipOutliers(x4)
  expect(y4.values).not.toStrictEqual(x4)
  expect(y4.wasClipped).toBe(true)
})

test("throws an error when attempting to clip outliers on non-vectors of non-numbers", () => {
  expect(() => {
    clipOutliers()
  }).toThrow()

  expect(() => {
    clipOutliers(normal([5, 5, 5, 5]))
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

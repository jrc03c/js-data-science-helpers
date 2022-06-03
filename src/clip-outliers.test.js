const clipOutliers = require("./clip-outliers.js")

const {
  clamp,
  normal,
  ones,
  random,
  round,
  shuffle,
  sort,
} = require("@jrc03c/js-math-tools")

test("attempts to clip outliers where there are none", () => {
  const x = [2, 2, 2, 3, 3, 3, 4, 4, 4]
  const [yPred, wasTransformed] = clipOutliers(x)
  expect(yPred).toStrictEqual(x)
  expect(wasTransformed).toBe(false)
})

test("attempts to clip outliers where there are none (v2)", () => {
  const x = clamp(normal(1000), -1, 1)
  const [yPred, wasTransformed] = clipOutliers(x)
  expect(yPred).toStrictEqual(x)
  expect(wasTransformed).toBe(false)
})

test("attempts to clip outliers on binary data", () => {
  const x = round(random(1000))
  const [yPred, wasTransformed] = clipOutliers(x)
  expect(yPred).toStrictEqual(x)
  expect(wasTransformed).toBe(false)
})

test("attempts to clip outliers when there's missing data", () => {
  const x = [1, 2, 3, "four"]
  const [yPred, wasTransformed] = clipOutliers(x)
  expect(yPred).toStrictEqual(x)
})

test("clips outliers", () => {
  const x = shuffle([1, 2, 3, 4, 100])
  const yTrue = [1, 2, 3, 4, 8]
  const [yPred, wasTransformed] = clipOutliers(x)
  expect(sort(yPred)).toStrictEqual(yTrue)
  expect(wasTransformed).toBe(true)
})

test("attempts to clip outliers when the data is uniform", () => {
  const x = ones(1000)
  const yTrue = x
  const [yPred, wasTransformed] = clipOutliers(x)
  expect(yPred).toStrictEqual(yTrue)
  expect(wasTransformed).toBe(false)
})

// test("fails to clip outliers when the outlier is the value immediately above or below the median", () => {
//   const x = round(random(1000))
//   x[5] = -1000
//   const [yPred, wasTransformed] = clipOutliers(x)
//   expect(wasTransformed).toBe(true)
// })

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

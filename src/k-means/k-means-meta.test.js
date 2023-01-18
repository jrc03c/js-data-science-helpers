const {
  add,
  int,
  normal,
  random,
  range,
  scale,
  shape,
} = require("@jrc03c/js-math-tools")

const { accuracy, orderCentroids } = require("./helpers")
const KMeansMeta = require("./k-means-meta")
const rScore = require("../r-score")
const trainTestSplit = require("../train-test-split")

test(`tests that the KMeansMeta model works correctly`, () => {
  const centroidsTrue = normal([5, 10]).map(row =>
    row.map(v => v * 100 + normal() * 100)
  )

  const labels = []

  const x = range(0, 500).map(() => {
    const index = int(random() * centroidsTrue.length)
    const c = centroidsTrue[index]
    labels.push(index)
    return add(c, scale(5, normal(shape(c))))
  })

  const [xTrain, xTest, labelsTrain, labelsTest] = trainTestSplit(x, labels)
  const model = new KMeansMeta()
  model.fit(xTrain)
  model.centroids = orderCentroids(centroidsTrue, model.centroids)

  const labelsTrainPred = model.predict(xTrain)
  const labelsTestPred = model.predict(xTest)

  expect(model.k).toBe(5)
  expect(rScore(centroidsTrue, model.centroids)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)
})

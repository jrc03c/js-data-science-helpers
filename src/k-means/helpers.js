const {
  add,
  argmin,
  assert,
  distance,
  flatten,
  int,
  isArray,
  isDataFrame,
  isEqual,
  isNumber,
  isSeries,
  normal,
  pow,
  random,
  range,
  scale,
  shape,
  subtract,
  sum,
  zeros,
} = require("@jrc03c/js-math-tools")

const trainTestSplit = require("../train-test-split")

function accuracy(yTrue, yPred) {
  if (isDataFrame(yTrue) || isSeries(yTrue)) {
    yTrue = yTrue.values
  }

  if (isDataFrame(yPred) || isSeries(yPred)) {
    yPred = yPred.values
  }

  assert(
    isEqual(shape(yTrue), shape(yPred)),
    "`yPred` and `yTrue` must have the same shape!"
  )

  const yTrueFlat = flatten(yTrue)
  const yPredFlat = flatten(yPred)
  let correct = 0

  yTrueFlat.forEach((v, i) => {
    if (v === yPredFlat[i]) correct++
  })

  return correct / yTrueFlat.length
}

function getDistanceMatrix(points) {
  const out = zeros([points.length, points.length])

  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distance(points[i], points[j])
      out[i][j] = d
      out[j][i] = d
    }
  }

  return out
}

function createGenericTest(Model) {
  test(`tests that the \`${Model.name}\` model works correctly`, () => {
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
    const model = new Model({ k: centroidsTrue.length })
    model.fit(xTrain)
    model.centroids = orderCentroids(centroidsTrue, model.centroids)

    const labelsTrainPred = model.predict(xTrain)
    const labelsTestPred = model.predict(xTest)

    expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
    expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)
  })
}

function isMatrix(x) {
  return isArray(x) && shape(x).length === 2
}

function isWholeNumber(x) {
  return isNumber(x) && parseInt(x) === x && x >= 0
}

function orderCentroids(ctrue, cpred) {
  return ctrue.map(c1 => {
    return cpred[argmin(cpred.map(c2 => sse(c1, c2)))]
  })
}

function sse(xtrue, xpred) {
  return sum(pow(subtract(xtrue, xpred), 2))
}

module.exports = {
  accuracy,
  createGenericTest,
  getDistanceMatrix,
  isMatrix,
  isWholeNumber,
  orderCentroids,
  sse,
}

const {
  DataFrame,
  isEqual,
  normal,
  range,
  seed,
  Series,
  shuffle,
} = require("@jrc03c/js-math-tools")

const rScore = require("./r-score")
const trainTestSplit = require("./train-test-split")

test("tests that `trainTestSplit` splits data correctly", () => {
  const a = normal([250, 2, 3, 4])
  const b = new DataFrame({ a: normal(250), b: normal(250), c: normal(250) })
  b.index = range(0, b.shape[0]).map(i => "b" + i)
  const c = new Series({ hello: normal(250) })
  c.index = range(0, c.shape[0]).map(i => "cee" + i)

  seed(12345)
  const index = shuffle(range(0, c.shape[0]))
  const testSize = 0.1
  const split = parseInt((1 - testSize) * index.length)
  const trainIndex = index.slice(0, split)
  const testIndex = index.slice(split)

  const aTrainTrue = a.filter((v, i) => trainIndex.indexOf(i) > -1)
  const aTestTrue = a.filter((v, i) => testIndex.indexOf(i) > -1)

  const bTrainTrue = b.get(trainIndex, null)
  const bTestTrue = b.get(testIndex, null)

  const cTrainTrue = c.get(trainIndex)
  const cTestTrue = c.get(testIndex)

  seed(12345)
  const [aTrainPred, aTestPred, bTrainPred, bTestPred, cTrainPred, cTestPred] =
    trainTestSplit(a, b, c, true, 0.1)

  expect(rScore(aTrainTrue, aTrainPred)).toBeGreaterThan(0.99)
  expect(rScore(aTestTrue, aTestPred)).toBeGreaterThan(0.99)

  expect(rScore(bTrainTrue, bTrainPred)).toBeGreaterThan(0.99)
  expect(isEqual(bTrainTrue.index, bTrainPred.index)).toBe(true)
  expect(isEqual(bTrainTrue.columns, bTrainPred.columns)).toBe(true)
  expect(rScore(bTestTrue, bTestPred)).toBeGreaterThan(0.99)
  expect(isEqual(bTestTrue.index, bTestPred.index)).toBe(true)
  expect(isEqual(bTestTrue.columns, bTestPred.columns)).toBe(true)

  expect(rScore(cTrainTrue, cTrainPred)).toBeGreaterThan(0.99)
  expect(isEqual(cTrainTrue.index, cTrainPred.index)).toBe(true)
  expect(cTrainTrue.name).toBe(cTrainPred.name)
  expect(rScore(cTestTrue, cTestPred)).toBeGreaterThan(0.99)
  expect(isEqual(cTestTrue.index, cTestPred.index)).toBe(true)
  expect(cTestTrue.name).toBe(cTestPred.name)
})

const {
  DataFrame,
  isArray,
  isDataFrame,
  isEqual,
  isSeries,
  mean,
  random,
  Series,
  shape,
  stdev,
} = require("@jrc03c/js-math-tools")

const rScore = require("./r-score")
const StandardScaler = require("./standard-scaler")

test("tests that the `StandardScaler` transforms and untransforms data correctly", () => {
  const scaler = new StandardScaler()

  const aShape = [100, 5]
  const a = new DataFrame(random(aShape))
  const aPred = scaler.fit(a).transform(a)
  expect(isDataFrame(aPred)).toBe(true)
  expect(isEqual(aPred.shape, aShape)).toBe(true)
  expect(rScore(a, scaler.untransform(aPred))).toBeCloseTo(1)

  aPred.apply(col => {
    expect(mean(col)).toBeCloseTo(0)
    expect(stdev(col)).toBeCloseTo(1)
  })

  const bShape = [100]
  const b = new Series(random(bShape))
  const bPred = scaler.fit(b).transform(b)
  expect(isSeries(bPred)).toBe(true)
  expect(isEqual(bPred.shape, bShape)).toBe(true)
  expect(mean(bPred)).toBeCloseTo(0)
  expect(stdev(bPred)).toBeCloseTo(1)
  expect(rScore(b, scaler.untransform(bPred))).toBeCloseTo(1)

  const cShape = [100, 5]
  const c = random(cShape)
  const cPred = scaler.fit(c).transform(c)
  expect(isArray(cPred) && !isDataFrame(cPred) && !isSeries(cPred)).toBe(true)
  expect(isEqual(shape(cPred), cShape)).toBe(true)
  expect(rScore(c, scaler.untransform(cPred))).toBeCloseTo(1)

  new DataFrame(cPred).apply(col => {
    expect(mean(col)).toBeCloseTo(0)
    expect(stdev(col)).toBeCloseTo(1)
  })

  const dShape = [100]
  const d = random(dShape)
  const dPred = scaler.fit(d).transform(d)
  expect(isArray(dPred) && !isDataFrame(dPred) && !isSeries(dPred)).toBe(true)
  expect(isEqual(shape(dPred), dShape)).toBe(true)
  expect(mean(dPred)).toBeCloseTo(0)
  expect(stdev(dPred)).toBeCloseTo(1)
  expect(rScore(d, scaler.untransform(dPred))).toBeCloseTo(1)
})

test("tests that the `StandardScaler` throws errors when asked to transform data with shapes different than the data on which it was trained", () => {
  const isVector = x => shape(x).length === 1

  const datasets = [
    new DataFrame(random([100, 10])),
    new Series(random(200)),
    random([25, 25]),
    random(50),
  ]

  for (let i = 0; i < datasets.length; i++) {
    for (let j = 0; j < datasets.length; j++) {
      if (i !== j) {
        const a = datasets[i]
        const b = datasets[j]

        if (!(isVector(a) && isVector(b))) {
          const scaler = new StandardScaler()
          scaler.fit(a)
          expect(() => scaler.transform(b)).toThrow()
          expect(() => scaler.untransform(b)).toThrow()
        }
      }
    }
  }
})

test("tests that the `StandardScaler` throws errors when given invalid data types", () => {
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

  wrongs.forEach(wrong => {
    const scaler = new StandardScaler()
    expect(() => scaler.fit(wrong)).toThrow()
    scaler.fit(random([10, 10]))
    expect(() => scaler.transform(wrong)).toThrow()
    expect(() => scaler.untransform(wrong)).toThrow()
  })
})

const {
  DataFrame,
  isEqual,
  isNumber,
  normal,
  range,
  Series,
  set,
  transpose,
} = require("@jrc03c/js-math-tools")

const common = require("./common.js")
const getPValueMatrix = require("./get-p-value-matrix.js")

test("gets a p-value matrix from a matrix containing identical columns", () => {
  const a = normal(100)
  const b = transpose(range(0, 5).map(() => a))
  const c = getPValueMatrix(b)
  const cSet = set(c)
  expect(cSet.length).toBe(1)
  expect(cSet[0]).toBe(1)

  const d = transpose([normal(100), normal(100).map(v => v + 100)])

  const eTrue = [
    [1, 0],
    [0, 1],
  ]
  const ePred = getPValueMatrix(d)
  expect(isEqual(ePred, eTrue)).toBe(true)

  const f = new DataFrame(normal([100, 5]))
  const g = new DataFrame(normal([100, 7]))

  expect(
    isEqual(getPValueMatrix(f, g).values, getPValueMatrix(f.values, g.values))
  ).toBe(true)

  common.shouldIgnoreNaNValues = false
  const h = normal([10, 10])
  h.forEach((row, i) => (row[i] = "uh-oh"))
  const gPred1 = getPValueMatrix(h)
  expect(set(gPred1).length).toBe(1)
  expect(set(gPred1)[0]).toBeNaN()

  common.shouldIgnoreNaNValues = true
  const gPred2 = getPValueMatrix(h)
  expect(set(gPred2).length).toBeGreaterThan(1)

  gPred2.forEach(row => {
    row.forEach(v => {
      expect(isNumber(v)).toBe(true)
    })
  })

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
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new Series({ hello: [10, 20, 30, 40, 50] }),
  ]

  wrongs.forEach(a => {
    wrongs.forEach(b => {
      expect(() => getPValueMatrix(a, b)).toThrow()
    })
  })
})

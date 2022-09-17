const {
  DataFrame,
  distance,
  identity,
  normal,
  range,
  Series,
  transpose,
} = require("@jrc03c/js-math-tools")

const getCorrelationMatrix = require("./get-correlation-matrix.js")
const orthonormalize = require("./orthonormalize.js")

test("tests that matrices can be correctly orthonormalized", () => {
  const a = normal([1000, 5])
  const bTrue = identity(5)
  const bPred = getCorrelationMatrix(orthonormalize(a))
  expect(distance(bPred, bTrue)).toBeLessThan(0.01)

  const c = normal(1000)

  const d = new DataFrame(
    transpose(range(0, 5).map(() => c.map(v => v + 1e-5 * normal())))
  )

  const eTrue = new DataFrame(identity(5))
  eTrue.index = eTrue.columns.slice()
  const ePred = getCorrelationMatrix(orthonormalize(d))
  expect(distance(ePred, eTrue)).toBeLessThan(0.01)

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

  wrongs.forEach(item => {
    expect(() => orthonormalize(item)).toThrow()
  })
})

const {
  DataFrame,
  isDataFrame,
  isEqual,
  normal,
  Series,
} = require("@jrc03c/js-math-tools")

const diagonalize = require("./diagonalize")

test("tests that an array can be correctly diagonalized", () => {
  const a = [2, 3, 4]

  const bTrue = [
    [2, 0, 0],
    [0, 3, 0],
    [0, 0, 4],
  ]

  const bPred = diagonalize(a)
  expect(isEqual(bPred, bTrue)).toBe(true)

  const c = normal(100)
  const dPred = diagonalize(c)

  dPred.forEach((row, i) => {
    expect(row[i]).toBe(c[i])
  })

  const e = new Series({ hello: normal(100) })
  const fPred = diagonalize(e)
  expect(isDataFrame(fPred)).toBe(true)
  expect(isEqual(fPred.index, fPred.columns)).toBe(true)
  expect(isEqual(fPred.values, diagonalize(e.values))).toBe(true)

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
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
  ]

  wrongs.forEach(item => {
    expect(() => diagonalize(item)).toThrow()
  })
})

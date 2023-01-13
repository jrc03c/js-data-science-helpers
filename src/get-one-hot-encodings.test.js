const {
  DataFrame,
  isEqual,
  normal,
  round,
  Series,
  set,
  sort,
  transpose,
} = require("@jrc03c/js-math-tools")

const getOneHotEncodings = require("./get-one-hot-encodings")

test("tests that values can be correctly one-hot-encoded", () => {
  const a = [2, 3, 4]
  const bTrue = { foo_3: [0, 1, 0], foo_4: [0, 0, 1] }
  const bPred = getOneHotEncodings("foo", a)
  expect(isEqual(bPred, bTrue)).toBe(true)

  const c = ["a", "a", "a", "b", "b", "b"]
  const dTrue = { hello_b: [0, 0, 0, 1, 1, 1] }
  const dPred = getOneHotEncodings("hello", c)
  expect(isEqual(dPred, dTrue)).toBe(true)

  const e = new Series({ hello: round(sort(normal(100))) })
  const fTypes = sort(set(e.values))

  const fTrue = new DataFrame(
    transpose(fTypes.slice(1).map(v => e.values.map(x => (x === v ? 1 : 0))))
  )

  fTrue.columns = fTypes.slice(1).map(v => "hello_" + v.toString())
  fTrue.index = e.index.slice()
  const fPred = getOneHotEncodings(e)
  expect(isEqual(fPred, fTrue)).toBe(true)

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
    expect(() => getOneHotEncodings(item)).toThrow()
  })

  wrongs.forEach(a => {
    wrongs.forEach(b => {
      expect(() => getOneHotEncodings(a, b)).toThrow()
    })
  })
})

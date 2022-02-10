const getOneHotEncodings = require("./get-one-hot-encodings.js")
const {
  range,
  sum,
  random,
  int,
  count,
  indexOf,
  normal,
} = require("@jrc03c/js-math-tools")

test("one-hot-encodes a small array", () => {
  const name = "test"
  const values = ["foo", "bar", "baz"]

  const yTrue = {
    test_bar: [0, 1, 0],
    test_baz: [0, 0, 1],
  }

  const yPred = getOneHotEncodings(name, values)
  expect(yPred).toStrictEqual(yTrue)
})

test("one-hot-encodes a large array", () => {
  const name = "test"
  const values = ["a", "b", "c", "d"]

  const x = range(0, 100).map(i => {
    return values[int(random() * values.length)]
  })

  const yPred = getOneHotEncodings(name, x)
  const counts = count(x)

  values
    .filter(v => v !== x[0])
    .forEach(v => {
      const colname = "test_" + v
      expect(sum(yPred[colname])).toBe(
        counts.filter(c => c.item === v)[0].count
      )
      expect(indexOf(x, v)).toStrictEqual(indexOf(yPred[colname], 1))
    })
})

test("throws an error when attempting to one-hot-encode non-string variable names and non-vectors", () => {
  expect(() => {
    getOneHotEncodings()
  }).toThrow()

  expect(() => {
    getOneHotEncodings("foo", normal([2, 3, 4]))
  }).toThrow()

  expect(() => {
    getOneHotEncodings(123, 456)
  }).toThrow()

  expect(() => {
    getOneHotEncodings(true, false)
  }).toThrow()

  expect(() => {
    getOneHotEncodings(undefined, null)
  }).toThrow()

  expect(() => {
    getOneHotEncodings(() => {}, {})
  }).toThrow()
})

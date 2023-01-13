const {
  DataFrame,
  dropNaN,
  normal,
  random,
  reshape,
  Series,
} = require("@jrc03c/js-math-tools")

const containsOnlyNumbers = require("./contains-only-numbers")

test("tests that arrays containing only numbers can be correctly identified", () => {
  expect(containsOnlyNumbers([2, 3, 4])).toBe(true)
  expect(containsOnlyNumbers([Infinity, -Infinity])).toBe(true)
  expect(containsOnlyNumbers([2, NaN, 4])).toBe(false)
  expect(containsOnlyNumbers(["hello", "world", 2, 3, 4])).toBe(false)

  let a = normal(100)
  a[parseInt(random() * a.length)] = "uh-oh"
  a = reshape(a, [2, 2, 5, 5])
  expect(containsOnlyNumbers(a)).toBe(false)
  expect(containsOnlyNumbers(dropNaN(a))).toBe(true)

  const b = new Series({ hello: normal(100) })
  expect(containsOnlyNumbers(b)).toBe(true)
  b.values[parseInt(random() * b.values.length)] = null
  expect(containsOnlyNumbers(b)).toBe(false)

  const c = new DataFrame({ foo: normal(100), bar: normal(100) })
  expect(containsOnlyNumbers(c)).toBe(true)

  c.values[parseInt(random() * c.shape[0])][parseInt(random() * c.shape[1])] =
    "goodbye"

  expect(containsOnlyNumbers(c)).toBe(false)

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

  wrongs.forEach(item => {
    expect(() => containsOnlyNumbers(item)).toThrow()
  })
})

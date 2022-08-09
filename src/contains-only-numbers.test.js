const { DataFrame, normal, random, Series } = require("@jrc03c/js-math-tools")
const containsOnlyNumbers = require("./contains-only-numbers.js")

test("checks if various arrays contain only numbers", () => {
  const rights = [
    234,
    [2, 3, 4],
    normal(100),
    normal([2, 3, 4, 5]),
    new Series(normal(100)),
    new DataFrame(normal([100, 25])),
  ]

  rights.forEach(x => {
    expect(containsOnlyNumbers(x)).toBe(true)
  })

  const wrongs = [
    [],
    "foo",
    [2, "three", 4],

    normal(100).map(v => {
      return random() < 0.5 ? null : v
    }),

    normal([100, 5]).map(row => {
      return row.map(v => {
        return random() < 0.5 ? true : v
      })
    }),

    new Series([2, 3, 4, () => {}, {}]),

    new DataFrame([
      [true, false],
      [null, undefined],
    ]),
  ]

  wrongs.forEach(x => {
    expect(containsOnlyNumbers(x)).toBe(false)
  })
})

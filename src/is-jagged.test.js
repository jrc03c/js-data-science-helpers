const { normal } = require("@jrc03c/js-math-tools")
const isJagged = require("./is-jagged.js")

test("tests that jagged arrays can be identified correctly", () => {
  const jaggeds = [
    [1, 2, [3]],
    [[2], [3, 4], [5, 6, 7]],
    [[[[[[0, [1]]]]]]],
    ["foo", ["bar", ["baz"]]],
    [[0], 1, [0], 1],
  ]

  jaggeds.forEach(x => {
    expect(isJagged(x)).toBe(true)
  })

  const nonJaggeds = [
    [2, 3, 4],
    [],
    [[[[[]]]]],
    [[[[[2, 3, 4]]]]],
    normal([2, 3, 4, 5]),
  ]

  nonJaggeds.forEach(x => {
    expect(isJagged(x)).toBe(false)
  })

  const wrongs = [234, "foo", true, false, null, undefined, {}, () => {}]

  wrongs.forEach(x => {
    expect(() => {
      isJagged(x)
    }).toThrow()
  })
})

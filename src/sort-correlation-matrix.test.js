const { DataFrame, isEqual, normal, Series } = require("@jrc03c/js-math-tools")
const getCorrelationMatrix = require("./get-correlation-matrix")
const sortCorrelationMatrix = require("./sort-correlation-matrix")

test("sorts a random correlation matrix", () => {
  // I haven't really thought of how to construct a good test for this yet,
  // though the manual testing I've done with it seems to have been successful
  // so far!

  const a = normal([1000, 5])
  const b = getCorrelationMatrix(a)
  expect(() => sortCorrelationMatrix(b)).not.toThrow()

  const c = new DataFrame(b)
  c.index = c.columns.slice()
  expect(() => sortCorrelationMatrix(c)).not.toThrow()

  expect(
    isEqual(sortCorrelationMatrix(b), sortCorrelationMatrix(c).values)
  ).toBe(true)

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
    expect(() => sortCorrelationMatrix(item)).toThrow()
  })
})

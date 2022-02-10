const getCorrelationMatrix = require("./get-correlation-matrix.js")
const getHighlyCorrelatedColumns = require("./get-highly-correlated-columns.js")
const { DataFrame, normal, add, scale } = require("@jrc03c/js-math-tools")

test("gets highly correlated columns when the columns are identical", () => {
  const temp = normal(1000)
  const x = new DataFrame({ a: temp, b: temp, c: normal(1000) })
  const c = new DataFrame(getCorrelationMatrix(x.values))
  c.index = x.columns
  c.columns = x.columns
  const results = getHighlyCorrelatedColumns(c)
  expect(results["a"]).toStrictEqual(["b"])
  expect(results["b"]).toStrictEqual(["a"])
  expect(results["c"]).toBe(undefined)
})

test("gets highly correlated columns when the columns are slightly different", () => {
  const temp = normal(1000)

  const x = new DataFrame({
    a: temp,
    b: add(temp, scale(0.0001, normal(1000))),
  })

  const c = new DataFrame(getCorrelationMatrix(x.values))
  c.index = x.columns
  c.columns = x.columns
  const results = getHighlyCorrelatedColumns(c)
  expect(results["a"]).toStrictEqual(["b"])
  expect(results["b"]).toStrictEqual(["a"])
  expect(x.get(null, "a").values).not.toStrictEqual(x.get(null, "b").values)
})

test("throws an error when attempting to get highly correlated columns using non-correlation-matrices", () => {
  expect(() => {
    getHighlyCorrelatedColumns()
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(normal([5, 5]))
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(new DataFrame(normal([5, 5])))
  }).toThrow()

  expect(() => {
    function symmetrize(x) {
      for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < x[i].length; j++) {
          x[i][j] = x[j][i]
        }
      }

      return x
    }

    const c = new DataFrame(symmetrize(normal([5, 5])))
    c.index = c.columns
    getHighlyCorrelatedColumns(c)
  }).not.toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(123)
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns("foo")
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(true)
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(false)
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(null)
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(undefined)
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns(() => {})
  }).toThrow()

  expect(() => {
    getHighlyCorrelatedColumns({})
  }).toThrow()
})

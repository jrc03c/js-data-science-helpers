const inferType = require("./infer-type.js")
const {
  float,
  int,
  random,
  range,
  copy,
  normal,
} = require("@jrc03c/js-math-tools")

test("correctly infers a variety of data types from strings", () => {
  // numbers
  const a = ["2.5", "-3.4", "72", "1e5", "0"]
  const aTrue = a.map(v => float(v))
  const aPred = inferType(a).values
  expect(aPred).toStrictEqual(aTrue)

  // booleans
  const b = ["true", "false", "TRUE", "True", "False"]
  const bTrue = [true, false, true, true, false]
  const bPred = inferType(b).values
  expect(bPred).toStrictEqual(bTrue)

  // dates
  const c = range(0, 5).map(v => {
    const year = int(random() * 50 + 1970)
    const month = int(random() * 12 + 1)
    const day = int(random() * 28 + 1)
    return `${month}-${day}-${year}`
  })

  const cTrue = c.map(v => new Date(v))
  const cPred = inferType(c).values
  expect(cPred).toStrictEqual(cTrue)

  // NOT arrays
  const d = ["[2, 3, 4]", "[5, 6, 7]", "[8, 9, 10]"]
  const dTrue = copy(d)
  const dPred = inferType(d).values
  expect(dPred).toStrictEqual(dTrue)

  // objects
  const e = [
    { foo: "bar" },
    { x: 5, y: 7, z: 9 },
    { yes: { no: "probably" } },
  ].map(v => JSON.stringify(v))

  const eTrue = e.map(v => JSON.parse(v))
  const ePred = inferType(e).values
  expect(ePred).toStrictEqual(eTrue)

  // otherwise unparseable strings
  const f = [
    "foo",
    "bar",
    "baz",
    "'Here's a quote!'",
    `"Here's another quote," she said.`,
  ]

  const fTrue = copy(f)
  const fPred = inferType(f).values
  expect(fPred).toStrictEqual(fTrue)

  // null values
  const g = ["1", "2", "3", "null", "5", "NaN", "undefined", "8"]
  const gTrue = [1, 2, 3, null, 5, null, null, 8]
  const gPred = inferType(g).values
  expect(gPred).toStrictEqual(gTrue)
})

test("correctly infers the data type when the types are mixed", () => {
  const a = ["1", "2", "3", "four", "5", "six"]
  const aTrue = [1, 2, 3, null, 5, null]
  const aPred = inferType(a).values
  expect(aPred).toStrictEqual(aTrue)

  const b = normal(1000).map(v => v.toString())

  for (let i = 0; i < 0.25 * b.length; i++) {
    const index = int(random() * b.length)
    b[index] = "true"
  }

  expect(inferType(b).type).toBe("number")

  const c = normal(1000).map(v => v.toString())

  for (let i = 0; i < 0.75 * c.length; i++) {
    const index = int(random() * c.length)
    c[index] = new Date().toJSON()
  }

  expect(inferType(c).type).toBe("date")

  const d = range(0, 1000).map(v => {
    if (random() < 0.1) {
      return "sldkfjsldkfjsldkjfsldkfj"
    } else {
      return JSON.stringify({ foo: "bar" })
    }
  })

  expect(inferType(d).type).toBe("object")
})

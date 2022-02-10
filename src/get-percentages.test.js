const getPercentages = require("./get-percentages.js")
const { normal } = require("@jrc03c/js-math-tools")

test("gets percentages of values in a small array", () => {
  const x = [2, 3, 3, 4]

  const yTrue = [
    { item: 2, count: 1, percentage: 0.25 },
    { item: 3, count: 2, percentage: 0.5 },
    { item: 4, count: 1, percentage: 0.25 },
  ]

  const yPred = getPercentages(x)
  expect(yPred).toStrictEqual(yTrue)
})

test("gets percentages of values in a big array", () => {
  const x = []

  for (let i = 0; i < 330; i++) x.push(5)
  for (let i = 0; i < 250; i++) x.push(10)
  for (let i = 0; i < 400; i++) x.push(15)
  for (let i = 0; i < 20; i++) x.push(20)

  const yTrue = [
    { item: 5, count: 330, percentage: 0.33 },
    { item: 10, count: 250, percentage: 0.25 },
    { item: 15, count: 400, percentage: 0.4 },
    { item: 20, count: 20, percentage: 0.02 },
  ]

  const yPred = getPercentages(x)
  expect(yPred).toStrictEqual(yTrue)
})

test("throws an error when attempting to get percentages in non-arrays", () => {
  expect(() => {
    getPercentages()
  }).toThrow()

  expect(() => {
    getPercentages([])
  }).not.toThrow()

  expect(() => {
    getPercentages(normal([5, 5, 5, 5]))
  }).not.toThrow()

  expect(() => {
    getPercentages(123)
  }).toThrow()

  expect(() => {
    getPercentages("foo")
  }).toThrow()

  expect(() => {
    getPercentages(true)
  }).toThrow()

  expect(() => {
    getPercentages(false)
  }).toThrow()

  expect(() => {
    getPercentages(null)
  }).toThrow()

  expect(() => {
    getPercentages(undefined)
  }).toThrow()

  expect(() => {
    getPercentages(() => {})
  }).toThrow()

  expect(() => {
    getPercentages({})
  }).toThrow()
})

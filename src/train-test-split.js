const {
  assert,
  isArray,
  isBoolean,
  isDataFrame,
  isSeries,
  int,
  isNumber,
  isUndefined,
  range,
  set,
  shape,
  shuffle,
} = require("@jrc03c/js-math-tools")

module.exports = function trainTestSplit() {
  const args = Array.from(arguments)
  const shouldShuffleArg = args.find(a => isBoolean(a))
  const shouldShuffle = isUndefined(shouldShuffleArg) ? true : shouldShuffleArg
  const testSizeArg = args.find(a => isNumber(a))
  const testSize = isUndefined(testSizeArg) ? 0.1 : testSizeArg

  assert(
    testSize > 0 && testSize < 1,
    "`testSize` must be a number between 0 and 1 (exclusive on both ends)!"
  )

  const dataArgs = args.filter(a => isArray(a) || isDataFrame(a) || isSeries(a))

  assert(
    dataArgs.length > 0,
    "You must pass at least one dataset into the `trainTestSplit` function!"
  )

  const shapes = dataArgs.map(d => shape(d)[0])

  assert(
    set(shapes).length === 1,
    `All datasets passed into the \`trainTestSplit\` function must be the same length at their shallowest dimension! The lengths of your datasets, though, are: ${shapes.join(
      ", "
    )}`
  )

  const out = []

  const index = shouldShuffle
    ? shuffle(range(0, shapes[0]))
    : range(0, shapes[0])

  const split = int((1 - testSize) * index.length)
  const trainIndex = index.slice(0, split)
  const testIndex = index.slice(split)

  dataArgs.forEach(d => {
    if (isDataFrame(d)) {
      out.push(d.get(trainIndex, null))
      out.push(d.get(testIndex, null))
    } else if (isSeries(d)) {
      out.push(d.get(trainIndex))
      out.push(d.get(testIndex))
    } else {
      const train = []
      const test = []

      d.forEach((v, i) => {
        if (trainIndex.indexOf(i) > -1) {
          train.push(v)
        } else {
          test.push(v)
        }
      })

      out.push(train)
      out.push(test)
    }
  })

  return out
}

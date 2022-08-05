const {
  assert,
  clamp,
  copy,
  dropMissingPairwise,
  isArray,
  isUndefined,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

const pValue = require("./p-value.js")

function getPValueMatrix(a, b) {
  if (isUndefined(b)) b = copy(a)

  assert(isArray(a) && isArray(b), "`getPValueMatrix` only works on matrices!")

  assert(
    shape(a).length === 2 && shape(b).length === 2,
    "`getPValueMatrix` only works on matrices!"
  )

  // note: this produces a "missing-aware" p-value matrix!
  const out = []
  const aTemp = transpose(a)
  const bTemp = transpose(b)

  aTemp.forEach(row1 => {
    const pValues = []

    bTemp.forEach(row2 => {
      const [row1Temp, row2Temp] = dropMissingPairwise(row1, row2)
      const p = clamp(pValue(row1Temp, row2Temp), 0, 1)
      pValues.push(p)
    })

    out.push(pValues)
  })

  return out
}

module.exports = getPValueMatrix

let pValue = require("./p-value.js")
let {
  isUndefined,
  copy,
  assert,
  isArray,
  shape,
  transpose,
  clamp,
  dropMissingPairwise,
} = require("@jrc03c/js-math-tools")

function getPValueMatrix(a, b) {
  if (isUndefined(b)) b = copy(a)

  assert(isArray(a) && isArray(b), "`getPValueMatrix` only works on matrices!")

  assert(
    shape(a).length === 2 && shape(b).length === 2,
    "`getPValueMatrix` only works on matrices!"
  )

  // note: this produces a "missing-aware" p-value matrix!
  let out = []
  let aTemp = transpose(a)
  let bTemp = transpose(b)

  aTemp.forEach(row1 => {
    let pValues = []

    bTemp.forEach(row2 => {
      let [row1Temp, row2Temp] = dropMissingPairwise(row1, row2)
      let p = clamp(pValue(row1Temp, row2Temp), 0, 1)
      pValues.push(p)
    })

    out.push(pValues)
  })

  return out
}

module.exports = getPValueMatrix

const {
  assert,
  clamp,
  copy,
  correl,
  dropMissingPairwise,
  isArray,
  isUndefined,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

function getCorrelationMatrix(a, b) {
  if (isUndefined(b)) b = copy(a)

  assert(
    isArray(a) && isArray(b),
    "`getCorrelationMatrix` only works on matrices!"
  )

  assert(
    shape(a).length === 2 && shape(b).length === 2,
    "`getCorrelationMatrix` only works on matrices!"
  )

  assert(
    shape(a)[0] === shape(b)[0],
    "Matrix `a` and `b` must have the number of rows!"
  )

  // note: this produces a "missing-aware" correlation matrix!
  const out = []
  const aTemp = transpose(a)
  const bTemp = transpose(b)

  aTemp.forEach(row1 => {
    const correlations = []

    bTemp.forEach(row2 => {
      try {
        const [row1Temp, row2Temp] = dropMissingPairwise(row1, row2)
        const r = clamp(correl(row1Temp, row2Temp), -1, 1)
        assert(r >= -1 && r <= 1, "Uh-oh!")
        correlations.push(r)
      } catch (e) {
        correlations.push(0)
      }
    })

    out.push(correlations)
  })

  return out
}

module.exports = getCorrelationMatrix

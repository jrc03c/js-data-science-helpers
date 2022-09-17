const {
  assert,
  copy,
  DataFrame,
  divide,
  isArray,
  isDataFrame,
  isJagged,
  shape,
  subtract,
  transpose,
} = require("@jrc03c/js-math-tools")

const containsOnlyNumbers = require("./contains-only-numbers.js")
const getMagnitude = require("./get-magnitude.js")
const project = require("./project.js")

function orthonormalize(x) {
  if (isDataFrame(x)) {
    const out = new DataFrame(orthonormalize(x.values))
    out.index = x.index.slice()
    out.columns = x.columns.slice()
    return out
  }

  assert(
    isArray(x) && !isJagged(x) && shape(x).length === 2,
    "`orthonormalize` only works on matrices!"
  )

  assert(
    containsOnlyNumbers(x),
    "`orthonormalize` only works on matrices of numbers!"
  )

  // note: this produces a matrix where the *columns* are orthogonal to each
  // other!
  // note: it's possible to do this without transposing the data twice; but my
  // tests seem to show that transposition is quite fast, even on quite large
  // matrices; so i think i'll leave it this way for now
  const temp = transpose(x)
  const bases = []

  temp.forEach(v => {
    let vCopy = copy(v)

    bases.forEach(basis => {
      vCopy = subtract(vCopy, project(vCopy, basis))
    })

    bases.push(vCopy)
  })

  const out = bases.map(basis => divide(basis, getMagnitude(basis)))
  return transpose(out)
}

module.exports = orthonormalize

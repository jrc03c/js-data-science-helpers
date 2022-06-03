const {
  add,
  assert,
  copy,
  isArray,
  pow,
  scale,
  shape,
  transpose,
} = require("@jrc03c/js-math-tools")

const containsOnlyNumbers = require("./contains-only-numbers.js")
const getMagnitude = require("./get-magnitude.js")
const project = require("./project.js")

const divide = (a, b) => scale(a, pow(b, -1))
const subtract = (a, b) => add(a, scale(b, -1))

function gramSchmidtOrthonormalize(x) {
  assert(isArray(x), "`gramSchmidtOrthonormalize` only works on matrices!")

  assert(
    containsOnlyNumbers(x),
    "`gramSchmidtOrthonormalize` only works on matrices of numbers!"
  )

  assert(
    shape(x).length === 2,
    "`gramSchmidtOrthonormalize` only works on matrices!"
  )

  // note: this produces a matrix where the *columns* are orthogonal to each other!
  const temp = transpose(x)
  const bases = []

  temp.forEach((v, i) => {
    let vCopy = copy(v)

    bases.forEach(basis => {
      vCopy = subtract(vCopy, project(vCopy, basis))
    })

    bases.push(vCopy)
  })

  const out = bases.map(basis => divide(basis, getMagnitude(basis)))
  return transpose(out)
}

module.exports = gramSchmidtOrthonormalize

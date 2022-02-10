let {
  assert,
  isArray,
  shape,
  transpose,
  copy,
  chop,
  distance,
  identity,
  dot,
  add,
  scale,
  pow,
} = require("@jrc03c/js-math-tools")

let containsOnlyNumbers = require("./contains-only-numbers.js")
let project = require("./project.js")
let getMagnitude = require("./get-magnitude.js")
let divide = (a, b) => scale(a, pow(b, -1))
let subtract = (a, b) => add(a, scale(b, -1))

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
  let temp = transpose(x)
  let bases = []

  temp.forEach((v, i) => {
    let vCopy = copy(v)
    bases.forEach(basis => (vCopy = subtract(vCopy, project(vCopy, basis))))
    bases.push(vCopy)
  })

  let out = bases.map(basis => divide(basis, getMagnitude(basis)))
  let outTranspose = transpose(out)

  // assert(
  //   chop(distance(identity(out.length), dot(out, outTranspose))) === 0,
  //   "The matrix produced by the `gramSchmidtOrthonormalize` function must be orthogonal!"
  // )

  return outTranspose
}

module.exports = gramSchmidtOrthonormalize

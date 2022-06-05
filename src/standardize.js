const normalize = require("./normalize.js")

function standardize() {
  return normalize(...arguments)
}

module.exports = standardize

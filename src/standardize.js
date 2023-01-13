const normalize = require("./normalize")

function standardize() {
  return normalize(...arguments)
}

module.exports = standardize

const {
  assert,
  isArray,
  shape,
  isString,
  count,
  isBoolean,
  isNumber,
  argmax,
  dropMissing,
  dropNaN,
  float,
} = require("@jrc03c/js-math-tools")

const nullValues = ["null", "none", "nan", "na", "n/a", "", "undefined"]
const booleanValues = ["true", "false", "yes", "no"]

function cast(value, type) {
  if (value === undefined) {
    value = "undefined"
  }

  if (type === "number") {
    const out = float(value)
    if (isNaN(out)) return null
    return out
  }

  if (type === "boolean") {
    try {
      const vBool = value.trim().toLowerCase()

      if (vBool === "true" || vBool === "yes") {
        return true
      }

      if (vBool === "false" || vBool === "no") {
        return false
      }
    } catch (e) {}

    return null
  }

  if (type === "date") {
    const out = new Date(value)
    if (out.toString() === "Invalid Date") return null
    return out
  }

  if (type === "object") {
    // note: don't return arrays!
    try {
      const out = JSON.parse(value)
      if (isArray(out)) return null
      return out
    } catch (e) {
      return null
    }
  }

  if (type === "string") {
    try {
      if (nullValues.indexOf(value.trim().toLowerCase()) > -1) return null
    } catch (e) {
      return null
    }

    return value
  }
}

function inferType(arr) {
  assert(
    isArray(arr),
    "The `inferType` function only works on one-dimensional arrays!"
  )

  assert(
    shape(arr).length === 1,
    "The `inferType` function only works on one-dimensional arrays!"
  )

  // possible types:
  // - number
  // - boolean
  // - date
  // - object
  // - null
  // - string
  // note: do NOT return arrays!
  const types = arr.map(v => {
    if (v === undefined) return "null"

    if (!isString(v)) {
      v = JSON.stringify(v)
    }

    const vLower = v.toLowerCase()
    const vLowerTrimmed = vLower.trim()

    // null
    if (nullValues.indexOf(vLowerTrimmed) > -1) {
      return "null"
    }

    // boolean
    if (booleanValues.indexOf(vLowerTrimmed) > -1) {
      return "boolean"
    }

    try {
      const vParsed = JSON.parse(v)

      // number
      if (isNumber(vParsed)) {
        return "number"
      }

      // object
      if (typeof vParsed === "object") {
        if (isArray(vParsed)) return "string"
        return "object"
      }

      return "string"
    } catch (e) {
      // date
      const vDate = new Date(v)

      if (vDate.toString() !== "Invalid Date") {
        return "date"
      }

      return "string"
    }
  })

  const counts = count(types).sort((a, b) => b.count - a.count)
  const primaryType = counts[0].item
  return { type: primaryType, values: arr.map(v => cast(v, primaryType)) }
}

module.exports = inferType

const {
  apply,
  assert,
  count,
  flatten,
  float,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
  isString,
} = require("@jrc03c/js-math-tools")

const nullValues = ["null", "none", "nan", "na", "n/a", "", "undefined"]
const booleanValues = ["true", "false", "yes", "no"]

function cast(value, type) {
  if (value === undefined) {
    value = "undefined"
  }

  if (type === "null") {
    return null
  }

  if (type === "number") {
    const out = float(value)
    if (isNaN(out)) return NaN
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
  if (isDataFrame(arr)) {
    const out = arr.copy()
    const results = inferType(arr.values)
    out.values = results.values
    return { type: results.type, values: out }
  }

  if (isSeries(arr)) {
    const out = arr.copy()
    const results = inferType(arr.values)
    out.values = results.values
    return { type: results.type, values: out }
  }

  assert(
    isArray(arr),
    "The `inferType` function only works on arrays, Series, and DataFrames!"
  )

  // possible types:
  // - number
  // - boolean
  // - date
  // - object
  // - null
  // - string
  // note: do NOT return arrays!
  const types = flatten(arr).map(v => {
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
  return { type: primaryType, values: apply(arr, v => cast(v, primaryType)) }
}

module.exports = inferType

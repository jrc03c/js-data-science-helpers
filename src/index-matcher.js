const {
  assert,
  intersect,
  isDataFrame,
  isSeries,
  isUndefined,
} = require("@jrc03c/js-math-tools")

class IndexMatcher {
  static DROP_NAN_MODE = "DROP_NAN_MODE"
  static DROP_MISSING_MODE = "DROP_MISSING_MODE"

  constructor(mode) {
    const self = this

    assert(
      isUndefined(mode) ||
        mode === IndexMatcher.DROP_NAN_MODE ||
        mode === IndexMatcher.DROP_MISSING_MODE,
      "The `mode` value passed into the `IndexMatcher` constructor must be undefined or one of [IndexMatcher.DROP_NAN_MODE, IndexMatcher.DROP_MISSING_MODE]! (By default, the mode is `Indexer.DROP_MISSING_MODE`.)"
    )

    self.mode = !isUndefined(mode) ? mode : IndexMatcher.DROP_MISSING_MODE
    self.index = null
  }

  fit() {
    const self = this
    const indices = []

    Object.values(arguments).forEach(x => {
      assert(
        isDataFrame(x) || isSeries(x),
        "The `IndexMatcher` only works on Series and DataFrames! To drop NaN values in a pair-wise fashion from regular arrays, use the `dropNaNPairwise` function from the @jrc03c/js-math-tools library."
      )

      if (self.mode === IndexMatcher.DROP_MISSING_MODE) {
        indices.push(x.dropMissing().index)
      } else {
        indices.push(x.dropNaN().index)
      }
    })

    self.index = intersect(...indices)
    return self
  }

  transform() {
    const self = this

    assert(
      !!self.index,
      "The IndexMatcher hasn't been fitted yet! Please call the `fit` method before calling the `transform` method."
    )

    const out = Object.values(arguments).map(x => {
      assert(
        isDataFrame(x) || isSeries(x),
        "The `IndexMatcher` only works on Series and DataFrames! To drop NaN values in a pair-wise fashion from regular arrays, use the `dropNaNPairwise` function from the @jrc03c/js-math-tools library."
      )

      return x.get(self.index, null)
    })

    return out.length === 1 ? out[0] : out
  }

  fitAndTransform() {
    const self = this
    return self.fit(...arguments).transform(...arguments)
  }
}

module.exports = IndexMatcher

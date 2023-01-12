const { MathError } = require("@jrc03c/js-math-tools")

const helpers = {
  clipOutliers: require("./clip-outliers.js"),
  cohensD: require("./cohens-d.js"),
  cohensd: require("./cohens-d.js"),
  common: require("./common.js"),
  containsOnlyNumbers: require("./contains-only-numbers.js"),
  diagonalize: require("./diagonalize.js"),
  getCorrelationMatrix: require("./get-correlation-matrix.js"),
  getHighlyCorrelatedColumns: require("./get-highly-correlated-columns.js"),
  getMagnitude: require("./get-magnitude.js"),
  getOneHotEncodings: require("./get-one-hot-encodings.js"),
  getPercentages: require("./get-percentages.js"),
  getPValueMatrix: require("./get-p-value-matrix.js"),
  IndexMatcher: require("./index-matcher.js"),
  inferType: require("./infer-type.js"),
  isBinary: require("./is-binary.js"),
  isCorrelationMatrix: require("./is-correlation-matrix.js"),
  normalize: require("./normalize.js"),
  orthonormalize: require("./orthonormalize.js"),
  preprocess: require("./preprocess.js"),
  project: require("./project.js"),
  pValue: require("./p-value.js"),
  rScore: require("./r-score.js"),
  sortCorrelationMatrix: require("./sort-correlation-matrix.js"),
  standardize: require("./standardize.js"),
  trainTestSplit: require("./train-test-split"),

  dump: function () {
    const self = this
    const pub = global || window

    if (!pub) {
      throw new MathError(
        "Cannot dump functions into global scope because neither `global` nor `window` exist in the current context!"
      )
    }

    Object.keys(self).forEach(key => {
      try {
        Object.defineProperty(pub, key, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: self[key],
        })
      } catch (e) {
        pub[key] = self[key]
      }
    })
  },
}

try {
  window.JSDataScienceHelpers = helpers
} catch (e) {}

try {
  module.exports = helpers
} catch (e) {}

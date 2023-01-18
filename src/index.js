const { MathError } = require("@jrc03c/js-math-tools")

const helpers = {
  clipOutliers: require("./clip-outliers"),
  cohensD: require("./cohens-d"),
  cohensd: require("./cohens-d"),
  common: require("./common"),
  containsOnlyNumbers: require("./contains-only-numbers"),
  diagonalize: require("./diagonalize"),
  getCorrelationMatrix: require("./get-correlation-matrix"),
  getHighlyCorrelatedColumns: require("./get-highly-correlated-columns"),
  getMagnitude: require("./get-magnitude"),
  getOneHotEncodings: require("./get-one-hot-encodings"),
  getPercentages: require("./get-percentages"),
  getPValueMatrix: require("./get-p-value-matrix"),
  IndexMatcher: require("./index-matcher"),
  inferType: require("./infer-type"),
  isBinary: require("./is-binary"),
  isCorrelationMatrix: require("./is-correlation-matrix"),
  KMeans: require("./k-means"),
  normalize: require("./normalize"),
  orthonormalize: require("./orthonormalize"),
  preprocess: require("./preprocess"),
  project: require("./project"),
  pValue: require("./p-value"),
  rScore: require("./r-score"),
  sortCorrelationMatrix: require("./sort-correlation-matrix"),
  standardize: require("./standardize"),
  StandardScaler: require("./standard-scaler"),
  trainTestSplit: require("./train-test-split"),

  dump() {
    const self = this

    const pub =
      typeof global !== "undefined"
        ? global
        : typeof window !== "undefined"
        ? window
        : null

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

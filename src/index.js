const helpers = {
  clipOutliers: require("./clip-outliers.js"),
  containsOnlyNumbers: require("./contains-only-numbers.js"),
  diagonalize: require("./diagonalize.js"),
  getCorrelationMatrix: require("./get-correlation-matrix.js"),
  getHighlyCorrelatedColumns: require("./get-highly-correlated-columns.js"),
  getMagnitude: require("./get-magnitude.js"),
  getOneHotEncodings: require("./get-one-hot-encodings.js"),
  getPercentages: require("./get-percentages.js"),
  getPValueMatrix: require("./get-p-value-matrix.js"),
  gramSchmidtOrthonormalize: require("./gram-schmidt-orthonormalize.js"),
  inferType: require("./infer-type.js"),
  isBinary: require("./is-binary.js"),
  normalize: require("./normalize.js"),
  preprocess: require("./preprocess.js"),
  project: require("./project.js"),
  pValue: require("./p-value.js"),
  rScore: require("./r-score.js"),
  sortCorrelationMatrix: require("./sort-correlation-matrix.js"),
  standardize: require("./standardize.js"),

  dump: function () {
    const self = this

    Object.keys(self).forEach(key => {
      global[key] = self[key]
    })
  },
}

try {
  window.JSDataScienceHelpers = helpers
} catch (e) {}

try {
  module.exports = helpers
} catch (e) {}

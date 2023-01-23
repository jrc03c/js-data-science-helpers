const {
  assert,
  isArray,
  isDataFrame,
  isEqual,
  isFunction,
  isUndefined,
  range,
  shape,
} = require("@jrc03c/js-math-tools")

const { isMatrix, isWholeNumber } = require("./helpers")
const KMeansPlusPlus = require("./k-means-plus-plus")

class KMeansMeta {
  constructor(config) {
    if (isUndefined(config)) {
      config = {}
    }

    assert(
      typeof config === "object",
      "`config` must be an object! See the documentation for more information about the properties that the `config` object can contain."
    )

    if (isUndefined(config.ks)) {
      config.ks = range(1, 16)
    }

    assert(isArray(config.ks), "`ks` must be an array of whole numbers!")

    config.ks.forEach(k => {
      assert(isWholeNumber(k), "`ks` must be an array of whole numbers!")
    })

    assert(
      isWholeNumber(config.maxIterations) || isUndefined(config.maxIterations),
      "`maxIterations` must be a whole number or undefined!"
    )

    assert(
      isWholeNumber(config.maxRestarts) || isUndefined(config.maxRestarts),
      "`maxRestarts` must be a whole number or undefined!"
    )

    assert(
      typeof config.tolerance === "number" || isUndefined(config.tolerance),
      "`tolerance` must be a number or undefined!"
    )

    const self = this
    self.ks = config.ks
    self.maxRestarts = config.maxRestarts || 25
    self.maxIterations = config.maxIterations || 100
    self.tolerance = config.tolerance || 1e-4
    self.scoreStopRatio = 0.85
    self.modelClass = config.modelClass || KMeansPlusPlus
    self.fittedModel = null
  }

  fit(x, progress) {
    // currently, this method uses the "elbow" method of determining when to
    // stop; but we should probably consider the "silhouette" method as well!
    const self = this

    assert(isMatrix(x), "`x` must be a matrix!")

    if (isDataFrame(x)) {
      x = x.values
    }

    if (!isUndefined(progress)) {
      assert(isFunction(progress), "If defined, `progress` must be a function!")
    }

    let lastK = self.ks[0]
    let lastScore = -Infinity

    for (let i = 0; i < self.ks.length; i++) {
      const k = self.ks[i]

      const model = new self.modelClass({
        k,
        maxRestarts: 10,
        maxIterations: 25,
      })

      model.fit(x, p => (progress ? progress((i + p) / self.ks.length) : null))
      const score = model.score(x)

      if (score / lastScore > self.scoreStopRatio) {
        break
      }

      lastK = k
      lastScore = score
    }

    self.fittedModel = new self.modelClass({
      k: lastK,
      maxRestarts: self.maxRestarts,
      maxIterations: self.maxIterations,
      tolerance: self.tolerance,
    })

    self.fittedModel.fit(x)
    if (progress) progress(1)
    return self
  }

  predict(x, centroids) {
    const self = this
    return self.fittedModel.predict(x, centroids)
  }

  score(x, centroids) {
    const self = this
    return self.fittedModel.score(x, centroids)
  }

  get k() {
    const self = this
    return self.fittedModel.k
  }

  set k(value) {
    throw new Error(
      "You can't set the k-value manually! It has to be set automatically via the `fit` method."
    )
  }

  get centroids() {
    const self = this
    return self.fittedModel.centroids
  }

  set centroids(centroids) {
    const self = this

    assert(
      isEqual(shape(centroids), shape(self.fittedModel.centroids)),
      "When assigning a new value to the `centroids` property, the new centroids must have the same shape as the old centroids!"
    )

    self.fittedModel.centroids = centroids
  }
}

module.exports = KMeansMeta

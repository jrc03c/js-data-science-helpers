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
    self.scoreStopRatio = config.scoreStopRatio || 0.85
    self.modelClass = config.modelClass || KMeansPlusPlus
    self.fittedModel = null
  }

  getFitStepFunction(x, progress) {
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

    const state = {
      isFinished: false,
      lastScore: -Infinity,
      currentIndex: 0,
    }

    return function fitStep() {
      const k = self.ks[state.currentIndex]

      const model = new self.modelClass({
        k,
        maxRestarts: 10,
        maxIterations: 20,
      })

      model.fit(x, p =>
        progress
          ? progress((state.currentIndex + p) / (self.ks.length + 1))
          : null
      )

      const score = model.score(x)

      if (score / state.lastScore > self.scoreStopRatio) {
        state.isFinished = true
        state.currentIndex--
      } else {
        state.lastScore = score

        if (state.currentIndex + 1 >= self.ks.length) {
          state.isFinished = true
        } else {
          state.currentIndex++
        }
      }

      if (state.isFinished) {
        self.fittedModel = new self.modelClass({
          k: self.ks[state.currentIndex],
          maxRestarts: self.maxRestarts,
          maxIterations: self.maxIterations,
        })

        self.fittedModel.fit(x, p =>
          progress
            ? progress((self.ks.length + p) / (self.ks.length + 1))
            : null
        )

        if (progress) {
          progress(1)
        }
      }

      return state
    }
  }

  fit(x, progress) {
    const self = this
    const fitStep = self.getFitStepFunction(x, progress)
    let state

    while (!state || !state.isFinished) {
      state = fitStep()
    }

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

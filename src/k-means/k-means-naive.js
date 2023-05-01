const {
  add,
  argmin,
  assert,
  copy,
  distance,
  divide,
  isDataFrame,
  isFunction,
  isUndefined,
  normal,
  random,
  range,
  scale,
  shuffle,
  zeros,
} = require("@jrc03c/js-math-tools")

const { isMatrix, isWholeNumber, sse } = require("./helpers")

class KMeansNaive {
  constructor(config) {
    assert(
      typeof config === "object",
      "`config` must be an object! See the documentation for more information about the properties that the `config` object can contain."
    )

    assert(isWholeNumber(config.k), "`k` must be a whole number!")

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
    self.k = config.k
    self.maxRestarts = config.maxRestarts || 25
    self.maxIterations = config.maxIterations || 100
    self.tolerance = config.tolerance || 1e-4
    self.centroids = null
  }

  initializeCentroids(x) {
    const self = this
    return shuffle(x).slice(0, self.k)
  }

  getFitStepFunction(x, progress) {
    const self = this

    assert(isMatrix(x), "`x` must be a matrix!")

    if (isDataFrame(x)) {
      x = x.values
    }

    if (!isUndefined(progress)) {
      assert(isFunction(progress), "If defined, `progress` must be a function!")
    }

    const centroids = self.initializeCentroids(x)

    const state = {
      currentRestart: 0,
      currentIteration: 0,
      currentCentroids: centroids,
      bestCentroids: centroids,
      bestScore: -Infinity,
      isFinished: false,
    }

    return function fitStep() {
      // get the labels for the points
      const labels = self.predict(x, state.currentCentroids)

      // average the points in each cluster
      const sums = []
      const counts = zeros(self.k)

      x.forEach((p, i) => {
        const k = labels[i]

        if (!sums[k]) {
          sums[k] = zeros(p.length)
        }

        sums[k] = add(sums[k], p)
        counts[k]++
      })

      const newCentroids = range(0, self.k).map(k => {
        // if for some reason the count for this centroid is 0, then no
        // points were assigned to this centroid, which means it's no longer
        // useful; so, instead, we'll just almost-duplicate another centroid
        // by copying it and adding a little bit of noise to it
        if (counts[k] === 0) {
          return add(
            state.currentCentroids[
              parseInt(random() * state.currentCentroids.length)
            ],
            scale(0.001, normal(state.currentCentroids[0].length))
          )
        } else {
          return divide(sums[k], counts[k])
        }
      })

      // if the change from the previous centroids to these new centroids
      // is very small (i.e., less then `tolerance`), then we should stop
      // iterating
      if (distance(state.currentCentroids, newCentroids) < self.tolerance) {
        state.currentIteration = self.maxIterations - 1
      } else {
        state.currentCentroids = newCentroids
      }

      if (progress) {
        progress(
          (state.currentRestart + state.currentIteration / self.maxIterations) /
            self.maxRestarts,
          self
        )
      }

      state.currentIteration++

      if (state.currentIteration >= self.maxIterations) {
        const score = self.score(x, state.currentCentroids)

        if (score > state.bestScore) {
          state.bestScore = score
          state.bestCentroids = copy(state.currentCentroids)
        }

        state.currentIteration = 0
        state.currentRestart++

        if (state.currentRestart >= self.maxRestarts) {
          state.isFinished = true
          self.centroids = state.bestCentroids

          if (progress) {
            progress(1, self)
          }
        } else {
          const newCentroids = self.initializeCentroids(x)
          state.currentCentroids = newCentroids
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
    centroids = centroids || self.centroids

    if (!centroids) {
      throw new Error(
        "No centroids were provided to the `predict` method, and the K-Means model hasn't been fitted yet. Please either pass centroids as a second parameter to the `predict` method or run the `fit` method first!"
      )
    }

    return x.map(p => argmin(centroids.map(c => distance(p, c))))
  }

  score(x, centroids) {
    const self = this
    centroids = centroids || self.centroids

    if (!centroids) {
      throw new Error(
        "No centroids were provided to the `score` method, and the K-Means model hasn't been fitted yet. Please either pass centroids as a second parameter to the `score` method or run the `fit` method first!"
      )
    }

    const labels = self.predict(x, centroids)
    const assigments = labels.map(k => centroids[k])
    return -sse(x, assigments)
  }
}

module.exports = KMeansNaive

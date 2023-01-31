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
    self._fitState = null
  }

  initializeCentroids(x) {
    const self = this
    return shuffle(x).slice(0, self.k)
  }

  fitStep(x, progress) {
    const self = this

    if (!self._fitState) {
      assert(isMatrix(x), "`x` must be a matrix!")

      if (isDataFrame(x)) {
        x = x.values
      }

      if (!isUndefined(progress)) {
        assert(
          isFunction(progress),
          "If defined, `progress` must be a function!"
        )
      }

      const centroids = self.initializeCentroids(x)

      self._fitState = {
        currentRestart: 0,
        currentIteration: 0,
        currentCentroids: centroids,
        bestCentroids: centroids,
        bestScore: -Infinity,
        isFinished: false,
      }
    } else if (self._fitState.isFinished) {
      return self
    }

    // get the labels for the points
    const labels = self.predict(x, self._fitState.currentCentroids)

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
          self._fitState.currentCentroids[
            parseInt(random() * self._fitState.currentCentroids.length)
          ],
          scale(0.001, normal(self._fitState.currentCentroids[0].length))
        )
      } else {
        return divide(sums[k], counts[k])
      }
    })

    // if the change from the previous centroids to these new centroids
    // is very small (i.e., less then `tolerance`), then we should stop
    // iterating
    if (
      distance(self._fitState.currentCentroids, newCentroids) < self.tolerance
    ) {
      self._fitState.currentIteration = self.maxIterations - 1
    } else {
      self._fitState.currentCentroids = newCentroids
    }

    if (progress) {
      progress(
        (self._fitState.currentRestart +
          self._fitState.currentIteration / self.maxIterations) /
          self.maxRestarts,
        self
      )
    }

    self._fitState.currentIteration++

    if (self._fitState.currentIteration >= self.maxIterations) {
      const score = self.score(x, self._fitState.currentCentroids)

      if (score > self._fitState.bestScore) {
        self._fitState.bestScore = score

        self._fitState.bestCentroids = copy(self._fitState.currentCentroids)
      }

      self._fitState.currentIteration = 0
      self._fitState.currentRestart++

      if (self._fitState.currentRestart >= self.maxRestarts) {
        self._fitState.isFinished = true
        self.centroids = self._fitState.bestCentroids

        if (progress) {
          progress(1, self)
        }
      } else {
        const newCentroids = self.initializeCentroids(x)
        self._fitState.currentCentroids = newCentroids
      }
    }

    return self
  }

  fit(x, progress) {
    const self = this

    if (self._fitState) {
      self._fitState = null
    }

    while (!self._fitState || !self._fitState.isFinished) {
      self.fitStep(x, progress)
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

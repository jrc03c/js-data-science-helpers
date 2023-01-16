const {
  assert,
  DataFrame,
  dropNaN,
  flatten,
  isArray,
  isDataFrame,
  isSeries,
  mean,
  range,
  Series,
  shape,
  stdev,
  transpose,
} = require("@jrc03c/js-math-tools")

const common = require("./common")

class StandardScaler {
  constructor() {
    const self = this
    self.means = []
    self.stdevs = []
    self.wasFittedOnAVector = false
    self.hasBeenFitted = false
  }

  _getDataArrayAndShape(x) {
    if (isDataFrame(x)) {
      return [x.values, x.shape]
    }

    if (isSeries(x)) {
      const out = transpose([x.values])
      return [out, shape(out)]
    }

    assert(
      isArray(x),
      "`x` must be a 1- or 2-dimensional array, DataFrame, or Series!"
    )

    const xShape = shape(x)

    assert(
      xShape.length < 3,
      "`x` must be a 1- or 2-dimensional array, DataFrame, or Series!"
    )

    if (xShape.length === 1) {
      xShape.push(1)
      x = transpose([x])
    }

    return [x, xShape]
  }

  fit(x) {
    const self = this
    const results = self._getDataArrayAndShape(x)
    x = results[0]
    const xShape = results[1]

    self.wasFittedOnAVector = xShape.indexOf(1) > -1
    self.means = []
    self.stdevs = []

    range(0, xShape[1]).forEach(j => {
      const values = x.map(row => row[j])

      if (common.shouldIgnoreNaNValues) {
        const valuesWithoutNaNs = dropNaN(values)
        self.means.push(mean(valuesWithoutNaNs))
        self.stdevs.push(stdev(valuesWithoutNaNs))
      } else {
        self.means.push(mean(values))
        self.stdevs.push(stdev(values))
      }
    })

    self.hasBeenFitted = true
    return self
  }

  transform(x) {
    const self = this

    if (!self.hasBeenFitted) {
      throw new Error(
        "This `StandardScaler` instance hasn't been trained on any data yet! Please use the `fit` method to train it before calling the `transform` method."
      )
    }

    if (isDataFrame(x)) {
      const out = new DataFrame(self.transform(x.values))
      out.columns = x.columns
      out.index = x.index
      return out
    }

    if (isSeries(x)) {
      const out = new Series(self.transform(x.values))
      out.name = x.name
      out.index = x.index
      return out
    }

    const results = self._getDataArrayAndShape(x)
    x = results[0]
    const xShape = results[1]

    assert(
      xShape[1] === self.means.length,
      "The data you passed into the `transform` function doesn't have the same number of columns as the data set on which this StandardScaler was fitted!"
    )

    const out = x.map(row => {
      return row.map((v, j) => {
        return (v - self.means[j]) / self.stdevs[j]
      })
    })

    if (self.wasFittedOnAVector) {
      return flatten(out)
    } else {
      return out
    }
  }

  untransform(x) {
    const self = this

    if (!self.hasBeenFitted) {
      throw new Error(
        "This `StandardScaler` instance hasn't been trained on any data yet! Please use the `fit` method to train it before calling the `transform` method."
      )
    }

    if (isDataFrame(x)) {
      const out = new DataFrame(self.untransform(x.values))
      out.columns = x.columns
      out.index = x.index
      return out
    }

    if (isSeries(x)) {
      const out = new Series(self.untransform(x.values))
      out.name = x.name
      out.index = x.index
      return out
    }

    const results = self._getDataArrayAndShape(x)
    x = results[0]
    const xShape = results[1]

    assert(
      xShape[1] === self.means.length,
      "The data you passed into the `untransform` function doesn't have the same number of columns as the data set on which this StandardScaler was fitted!"
    )

    const out = x.map(row => {
      return row.map((v, j) => {
        return v * self.stdevs[j] + self.means[j]
      })
    })

    if (self.wasFittedOnAVector) {
      return flatten(out)
    } else {
      return out
    }
  }
}

module.exports = StandardScaler

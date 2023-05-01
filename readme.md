# Intro

This is just a little library of helper functions for doing data science stuff in JS. It's probably not very well written.

# Installation

```bash
npm install --save https://github.com/jrc03c/js-data-science-helpers
```

# Usage

## In Node or with bundlers

Pull out individual functions:

```js
const { clipOutliers, containsOnlyNumbers, ... } = require("@jrc03c/js-data-science-helpers")
```

Or dump all of the functions into the global scope:

```js
require("@jrc03c/js-data-science-helpers").dump()
```

## As a standalone script in the browser

```html
<script src="/path/to/dist/js-data-science-helpers.js"></script>

<script>
  // pull out individual functions:
  const { clipOutliers, containsOnlyNumbers, ... } = JSDataScienceHelpers

  // or dump everything into the global scope:
  JSDataScienceHelpers.dump()
</script>
```

# To do

- At some point, the `clipOutliers` function provided the option of taking the log of the values after clipping them. I'm not sure why I dropped this, but I should probably take a closer look at whether it's useful or not.

# API

### `clipOutliers(x, maxScore=5)`

Clips all values in a `x` to the range [`median(x) - maxScore * MAD(x)`, `median(x) + maxScore * MAD(x)`]. (See: [MAD](https://en.wikipedia.org/wiki/Median_absolute_deviation))

### `cohensd(a, b)`

Returns the Cohen's _D_ value for two vectors or `Series` instances `a` vs. `b`.

### `containsOnlyNumbers(x)`

Returns a boolean indicating whether or not `x` contains only numbers.

### `convertToNumerical(df, config)`

Given a matrix or `DataFrame` and an optional `config` object, returns a cleaned-up matrix or `DataFrame` that contains only numerical values (including `NaN` values).

If provided, the `config` object can contain these values:

- `correlationThreshold` = the coefficient of correlation threshold above which two columns will be considered to be virtually identical (and one will be dropped); the default is `1 - 1e-5 = 0.99999`
- `maxUniqueValues` = the number of unique values above which a column will no longer be eligible for one-hot-encoding; the default is `7`
- `minNonMissingValues` = the number of non-missing values below which the column will be dropped; the default is `15`
- `progress` = a callback function that is passed a single value in the range `[0, 1]` that represents the fraction of preprocessing completed

The cleaning process involves:

- inferring the types of all columns and casting column values into those inferred types, including:
  - converting booleans to 0s and 1s
  - converting dates to integers (as milliseconds since the Unix epoch (midnight on January 1, 1970); see [`Date.prototype.getTime()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime))
- dropping all but 1 of any duplicate or highly correlated columns (i.e., _r_ > `correlationThreshold`)
- dropping any columns with fewer than 15 non-missing values
- dropping any columns with only 1 unique value
- one-hot-encoding any columns where the top `maxUniqueValues` unique values account for at least 90% of all of the values (and if there are any other values left over, then they're returned in an "other" column)
- dropping all other columns that cannot be converted to numbers (e.g., string columns containing all unique values)

### `diagonalize(x)`

Turns 1-dimensional array or `Series` `x` into a square matrix with the values of `x` along the main diagonal (top left to bottom right) and zeros everywhere else. For example:

```js
const { diagonalize } = require("@jrc03c/js-data-science-helpers")

diagonalize([1, 2, 3])
// [
//   [1, 0, 0],
//   [0, 2, 0],
//   [0, 0, 3],
// ]
```

### `getCorrelationMatrix(a, b=null)`

Returns a correlation matrix containing the correlations of every column in `a` against every column in `b`. If `b === null`, then `a` is just compared against itself.

### `getHighlyCorrelatedColumns(a, b=null, threshold=(1 - 1e-5))` <br> `getHighlyCorrelatedColumns(c, threshold=(1 - 1e-5))`

Returns a dictionary of columns and their highly correlated counterparts given (1) `a` and `b`, two matrices or `DataFrame` instances for which a correlation matrix has not yet been computed, or (2) a correlation matrix `c`. An optional `threshold` can be specified, which defines the correlation (_r_) value above which columns are considered to be highly correlated.

The return value might look something like this:

```js
{
  col1: ["col1", "col7", ...],
  col2: ["col2", "col4", ...]
}
```

Note that literally identical columns will be included among the results. So, for example, if you only pass an `a` value into the function, then every column will _at least_ be identical to itself (meaning that there will be at least one column name in every array in the object), though it might also be highly correlated with other columns.

### `getMagnitude(x)`

Returns the Euclidean length (i.e., the 2-norm) of `x`.

### `getOneHotEncodings(name, values)` <br> `getOneHotEncodings(series)`

Given a vector containing _n_ unique values, returns an dictionary with _n_-1 key-value pairs where each key is `name` + a unique value and each value is a vector of binary values indicating whether or not `x` matches that particular unique value. For example:

```js
const { getOneHotEncodings } = require("@jrc03c/js-data-science-helpers")
const x = [2, 2, 3, 4, 2, 4]
const encodings = getOneHotEncodings("foo", x)
console.log(encodings)
// { foo_3: [ 0, 0, 1, 0, 0, 0 ], foo_4: [ 0, 0, 0, 1, 0, 1 ] }
```

### `getPValueMatrix(x)`

Returns a matrix containing the _p_-values of every column in `a` against every column in `b`. If `b === null`, then `a` is just compared against itself.

### `getPercentages(x)`

Returns an array in which each value is an object representing a unique value in `x` with the properties `value`, `count`, and `percentages`. For example:

```js
const { getPercentages } = require("@jrc03c/js-data-science-helpers")

const x = ["a", "a", "b", "c"]
const percentages = getPercentages(x)
console.log(percentages)
// [
//   { value: "a", count: 2, percentage: 0.5 },
//   { value: "b", count: 1, percentage: 0.25 },
//   { value: "c", count: 1, percentage: 0.25 }
// ]
```

### `IndexMatcher(mode=IndexMatcher.DROP_MISSING_MODE)`

The `IndexMatcher` class makes it relatively easy to make sure that two `Series` or `DataFrame` instances have the same index. The constructor takes a single argument, the `mode`, which is one of:

- `IndexMatcher.DROP_MISSING_MODE`
- `IndexMatcher.DROP_NAN_MODE`

In the first mode, rows are dropped only if they contain null, undefined, or NaN values. In the second mode, rows are dropped if they contain any non-numerical values.

#### `IndexMatcher.fit(a, b, c, ...)`

Records the index which is common to all of the given datasets.

#### `IndexMatcher.transform(a, b, c, ...)`

Transforms the given datasets to have the index that was recorded by the `fit` function. Note that a single array containing all of the transformed datasets is returned. So, a common syntax might be something like:

```js
const a = new DataFrame(...)
const b = new DataFrame(...)
const c = new DataFrame(...)

const matcher = new IndexMatcher()
const [d, e, f] = matcher.fit(a, b, c).transform(a, b, c)
```

#### `IndexMatcher.fitAndTransform(a, b, c, ...)`

Performs the fitting and transforming in a single step. So, similar to the example above:

```js
const a = new DataFrame(...)
const b = new DataFrame(...)
const c = new DataFrame(...)

const [d, e, f] = new IndexMatcher().fitAndTransform(a, b, c)
```

### `isBinary(x)`

Returns a boolean indicating whether or not `x` contains only binary data (0s and 1s).

### `isJagged(x)`

Returns a boolean indicating whether or not the array `x` is jagged / ragged (i.e., whether or not it has nested arrays of inconsistent length).

### `KMeans`

The two primary _K_-means models from which to choose are `KMeansPlusPlus` and `KMeansMeta`. The former should be used if you already know how many clusters there are in your data; otherwise, the latter model can be used to find the optimal _K_-value.

Although I don't think [sklearn](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) has a comparable `KMeansMeta` model, I've nevertheless tried to mimic their API in both of these classes. Importantly, just like sklearn's model, the `score` method returns the _negative_ of the _K_-means objective. Since the _K_-means objective is the within-cluster sum of squared errors, the `score` method returns the negative of that value such that higher scores are better than lower scores, which follows the sklearn scoring convention.

To use them, import them from the `KMeans` namespace, like this:

```js
const { KMeansMeta, KMeansPlusPlus } =
  require("@jrc03c/js-data-science-helpers").KMeans
```

Note that the API is virtually identical across the two classes. The main differences appear in the constructor functions. But the `fit`, `predict`, and `score` methods, as well as the `centroids` property, should work the same way in both classes.

#### `KMeansPlusPlus(config)`

The constructor for the base model takes a configuration object argument. The only required property in this object is `k`, the number of cluster centers (AKA centroids). Optional properties include:

- `maxRestarts` = the number of times that the algorithm is allowed to start over with new a new batch of centroids; the default value is 25
- `maxIterations` = the number of times within a single restart that the algorithm is allowed to update the centroids' positions; the default value is 100
- `tolerance` = the update distance threshold below which the algorithm stops iterating; the update distance is the Euclidean distance between one iteration's centroid positions and the next iteration's centroid positions, so if the update is sufficiently small, then we consider the algorithm to have converged and thus stop iterating; the default value is 1e-4

These four values all become properties of the `KMeansPlusPlus` instance (keeping their same names).

#### `KMeansMeta(config)`

The constructor for the meta model takes a configuration object argument. There are no required properties for this object. Optional properties include:

- `ks` = the _K_-values to test; the default value is the range `[1, 16)`
- `maxRestarts` = the number of restarts to pass into the constructor of the final fitted model (after finding the best _K_)
- `maxIterations` = the number of iterations to pass into the constructor of the final fitted model (after finding the best _K_)
- `tolerance` = the update distance threshold to pass into the constructor of the final fitted model (after finding the best _K_)
- `modelClass` = the class definition to use during the fitting process; the default value is the `KMeansPlusPlus` class

#### `(KMeansPlusPlus || KMeansMeta).fit(x, progress)`

Fits the model to the two-dimensional data, `x`. Optionally, a `progress` callback function can be provided. This function takes a single argument that represents the overall completion of the `fit` method (in terms of restarts and iterations) expressed as a fraction between 0 and 1.

#### `(KMeansPlusPlus || KMeansMeta).getFitStepFunction(x, progress)`

Returns a function that updates the fitting state. Most of the time, you'll probably want to use the `fit` method. But there may be cases where it's preferable to use a step function that slowly increments the fitting state, like when drawing an animation of the fitting process or when trying to avoid locking up the browser window. Here's an example of how to use it:

```js
// set up model, then:
const fitStep = model.getFitStepFunction(x, progress)
let state

while (!state || !state.isFinished) {
  state = fitStep()
}

// done!
```

#### `(KMeansPlusPlus || KMeansMeta).predict(x, centroids)`

Returns the labels for each point in `x`. A label is an index into the model's `centroids` array. Optionally, an alternative set of `centroids` can be supplied as the second argument.

#### `(KMeansPlusPlus || KMeansMeta).score(x, centroids)`

Returns the negative of the _K_-means objective. The _K_-means objective is the within-cluster sum of squared errors; so the `score` method returns the negative of that value (so that higher scores are better than lower scores). See the note at the start of this section for more info.

#### `(KMeansPlusPlus || KMeansMeta).centroids`

The array of learned centroids. It's only available after the `fit` method has been run.

### `normalize(x)`

Identical to the `standardize` function. Returns a transformed copy of `x` in which the values have been converted to _z_-scores. In other words: `(x - mean(x)) / stdev(x)`

### `orthonormalize(x)`

Returns a transformed copy of a matrix or `DataFrame` `x` in which all of the columns have been made orthogonal to each other. (See: [Gram-Schmidt process](https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process)) This is particularly useful for generating random datasets with uncorrelated features.

### `pValue(a, b)`

Returns the _p_-value of two vectors using Welch's _t_-test. (See: [Welch's _t_-test](https://en.wikipedia.org/wiki/Welch's_t-test)) Note that this function returns results that are very, very close to [scipy's `ttest_ind` function](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html) when the latter is invoked this way:

```python
ttest_ind(a, b, equal_var=False, nan_policy="omit")
```

I'm not sure why there's a very slight variation in returned _p_-values between my version of the function and scipy's. It's possible that there's some subtle degrees-of-freedom difference in our implementations; or maybe they have a better way of computing the probability of _t_ (because mine uses a table of values and theirs may use a continuous function or whatever). However, after lots of testing, I feel pretty confident that these small differences are probably not significant. Let me know if you disagree, though. 😊

### `project(v, u)`

Returns the projection of vector or `Series` `v` onto vector or `Series` `u`.

### `rScore(xTrue, xPred)`

Returns (roughly) the square root of the <i>R</i><sup>2</sup> value of `xTrue` versus `xPred`. Since <i>R</i><sup>2</sup> can be negative, the actual value returned is `sign(R^2) * sqrt(abs(R^2))`. The two datasets can be any shape provided that they have the same shape as each other.

### `sortCorrelationMatrix(c)`

Sorts a correlation matrix (array or `DataFrame`) so that variables near each other in the visualization are also highly correlated with one another. The first variable chosen is the one with the highest sum of squared correlations. The second variable chosen is the remaining variable most highly correlated with the first; the third variable chosen is the remaining variable most highly correlated with the second; and so on. This algorithm is called the Hunter chain method. (See: ["Methods of Reordering the Correlation Matrix to Vacilitate Visual Inspection and Preliminary Cluster Analysis" by John Edward Hunter](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1745-3984.1973.tb00782.x))

### `standardize(x)`

Identical to the `normalize` function.

### `StandardScaler`

Transforms and/or untransforms 1- or 2-dimensional data in basically the same way as the `normalize` function. However, having the functionality wrapped in a class makes it easier to apply the same transformation or untransformation across multiple datasets. Its functionality is supposed to mimic [sklearn's `StandardScaler`](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html).

#### `StandardScaler.fit(x)`

Learns the means and standard deviations of each column in `x`. If `x` is a 1-dimensional array or `Series`, then it's treated as a 1-column matrix or `DataFrame` respectively.

#### `StandardScaler.transform(x)`

Transforms each column in `x` by subtracting that column's corresponding mean and dividing by that column's corresponding standard deviation (i.e., the means and standard deviations learned in the `fit` method). If `x` is a 1-dimensional array or `Series`, then it's treated as a 1-column matrix or `DataFrame` respectively. The number of columns in `x` must be the same as the number of columns in the data on which the `StandardScaler` instance was trained.

#### `StandardScaler.untransform(x)`

Reverses the transformation done by the `transform` method. Specifically, it transforms each column in `x` by multiplying by that column's corresponding standard deviation and adding that column's corresponding mean. If `x` is a 1-dimensional array or `Series`, then it's treated as a 1-column matrix or `DataFrame` respectively. The number of columns in `x` must be the same as the number of columns in the data on which the `StandardScaler` instance was trained.

### `trainTestSplit(a, b, c, ..., testSize=0.1, shouldShuffle=true)`

Splits the given datasets into train and test sets in the same way as [sklearn's `train_test_split` function](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html).

# Notes

### Handling NaN values

Many of the calculations in this library can't be done correctly if the given dataset includes NaN values. By default, the library automatically drops NaN values in every relevant calculation, no errors are thrown, and no warnings are given.

For example, the `normalize` function relies on being able to compute the mean and standard deviation of a dataset; but any NaNs in the dataset will cause the mean and standard deviation to be NaN as well. So the function drops NaN values first, then computes the mean and standard deviation from the remaining values, and then uses the mean and standard deviation to transform the original dataset.

However, if you'd prefer that these functions should include NaN values in their calculations, then you can override the default setting this way:

```js
const { common } = require("@jrc03c/js-data-science-helpers")
common.shouldIgnoreNaNValues = false
```

By default, the `normalize` function would return results like this:

```js
const { normalize } = require("@jrc03c/js-data-science-helpers")
const x = [2, 3, "four", 5, 6]
normalize(x)
// [
//   -1.2649110640673518,
//   -0.6324555320336759,
//   NaN,
//   0.6324555320336759,
//   1.2649110640673518
// ]
```

But if we override the default setting and allow NaN values to be used in the calculations, then we get results like this:

```js
const { common, normalize } = require("@jrc03c/js-data-science-helpers")
common.shouldIgnoreNaNValues = false

const x = [2, 3, "four", 5, 6]
normalize(x)
// [NaN, NaN, NaN, NaN, Nan]
```

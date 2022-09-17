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

# API

## `clipOutliers(x, maxScore=5)`

Clips all values in a `x` to the range [`median(x) - maxScore * MAD(x)`, `median(x) + maxScore * MAD(x)`]. (See: [MAD](https://en.wikipedia.org/wiki/Median_absolute_deviation))

## `cohensd(a, b)`

Returns the Cohen's _D_ value for two vectors or `Series` instances `a` vs. `b`.

## `containsOnlyNumbers(x)`

Returns a boolean indicating whether or not `x` contains only numbers.

## `diagonalize(x)`

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

## `getCorrelationMatrix(a, b=null)`

Returns a correlation matrix containing the correlations of every column in `a` against every column in `b`. If `b === null`, then `a` is just compared against itself.

## `getHighlyCorrelatedColumns(a, b=null, threshold=(1 - 1e-5))` <br> `getHighlyCorrelatedColumns(c, threshold=(1 - 1e-5))`

Returns a dictionary of columns and their highly correlated counterparts given (1) `a` and `b`, two matrices or `DataFrame` instances for which a correlation matrix has not yet been computed, or (2) a correlation matrix `c`. An optional `threshold` can be specified, which defines the correlation (_r_) value above which columns are considered to be highly correlated.

The return value might look something like this:

```js
{
  col1: ["col1", "col7", ...],
  col2: ["col2", "col4", ...]
}
```

Note that literally identical columns will be included among the results. So, for example, if you only pass an `a` value into the function, then every column will _at least_ be identical to itself (meaning that there will be at least one column name in every array in the object), though it might also be highly correlated with other columns.

## `getMagnitude(x)`

Returns the Euclidean length (i.e., the 2-norm) of `x`.

## `getOneHotEncodings(name, values)` <br> `getOneHotEncodings(series)`

Given a vector containing _n_ unique values, returns an dictionary with _n_-1 key-value pairs where each key is `name` + a unique value and each value is a vector of binary values indicating whether or not `x` matches that particular unique value. For example:

```js
const { getOneHotEncodings } = require("@jrc03c/js-data-science-helpers")
const x = [2, 2, 3, 4, 2, 4]
const encodings = getOneHotEncodings("foo", x)
console.log(encodings)
// { foo_3: [ 0, 0, 1, 0, 0, 0 ], foo_4: [ 0, 0, 0, 1, 0, 1 ] }
```

## `getPValueMatrix(x)`

Returns a matrix containing the _p_-values of every column in `a` against every column in `b`. If `b === null`, then `a` is just compared against itself.

## `getPercentages(x)`

Returns an array in which each value is an object representing a unique value in `x` with the properties `item`, `count`, and `percentages`. For example:

```js
const { getPercentages } = require("@jrc03c/js-data-science-helpers")

const x = ["a", "a", "b", "c"]
const percentages = getPercentages(x)
console.log(percentages)
// [
//   { item: "a", count: 2, percentage: 0.5 },
//   { item: "b", count: 1, percentage: 0.25 },
//   { item: "c", count: 1, percentage: 0.25 }
// ]
```

## `IndexMatcher(mode=IndexMatcher.DROP_MISSING_MODE)`

The `IndexMatcher` class makes it relatively easy to make sure that two `Series` or `DataFrame` instances have the same index. The constructor takes a single argument, the `mode`, which is one of:

- `IndexMatcher.DROP_MISSING_MODE`
- `IndexMatcher.DROP_NAN_MODE`

In the first mode, rows are dropped only if they contain null, undefined, or NaN values. In the second mode, rows are dropped if they contain any non-numerical values.

### `IndexMatcher.fit(a, b, c, ...)`

Records the index which is common to all of the given datasets.

### `IndexMatcher.transform(a, b, c, ...)`

Transforms the given datasets to have the index that was recorded by the `fit` function. Note that a single array containing all of the transformed datasets is returned. So, a common syntax might be something like:

```js
const a = new DataFrame(...)
const b = new DataFrame(...)
const c = new DataFrame(...)

const matcher = new IndexMatcher()
const [d, e, f] = matcher.fit(a, b, c).transform(a, b, c)
```

### `IndexMatcher.fitAndTransform(a, b, c, ...)`

Performs the fitting and transforming in a single step. So, similar to the example above:

```js
const a = new DataFrame(...)
const b = new DataFrame(...)
const c = new DataFrame(...)

const [d, e, f] = new IndexMatcher().fitAndTransform(a, b, c)
```

## `inferType(x)`

Given a vector `x`, returns an object with these properties:

- `type` = one of these:
  - boolean
  - date
  - null
  - number
  - object
  - string
- `values` = all of the values in `x` cast into the inferred type

### Inferrable types

The inferrable types listed above correspond roughly to the main JS data types, but there are a few exceptions.

First, "date" is not a data type in JS. There are `Date` objects, of course, but `typeof new Date()` returns "object". Since dates are commonly stored in datasets and because they come with their own particular set of challenges, I've set these apart as their own data type so that they won't be conflated with other kinds of objects.

Second, arrays are not among the inferrable types because `x` is assumed to be a vector, and allowing `x` to be potentially nested makes it difficult to determine whether `x` is supposed to be a vector, matrix, tensor, mixed data structure, etc. If pass in an array `x` that's nested, then the sub-arrays will be ignored; only the values they contain will be used for inference.

### Alternate values

It's pretty common for datasets to contain boolean-ish and null-ish values, by which I mean string values like "yes", "no", "NaN", "NONE", "undefined", "NA", etc., or even empty strings. Those values are sort of like boolean or null values, but they're not always consistent or suitable for immediate inference by something like the `JSON.parse` function. Therefore, the `inferTypes` function tries to look for such values. For example, if it encounters a string value like "YES", it counts that value as a boolean, _not_ as a string! In fact, counting a value as a string is the function's very last resort since it's so common for values to be included accidentally as strings. For example, if you use a library like [papaparse](https://www.papaparse.com/) to read a CSV file from disk, then the returned data may just be a matrix of strings and nothing more; i.e., it's probably pretty common for such libraries to avoid making inferences about the data, leaving such work up to the user. So, when the `inferTypes` function encounters a string value, it does its best to cast it into any other data type first; but if it fails to find any suitable type, it gives up and assumes that the value is just a plain ol' string. Here are the lists of boolean-ish and null-ish values that are parsed as booleans and nulls respectively (accounting for case sensitivity, of course):

Nulls:

- ""
- "n/a"
- "na"
- "nan"
- "none"
- "null"
- "undefined"

Booleans:

- "true"
- "false"
- "yes"
- "no"

This function doesn't cover every possible edge case, of course; it should probably only be expected to work on an average dataset. If your data is especially unusual, please consider manually inferring types some other way.

## `isBinary(x)`

Returns a boolean indicating whether or not `x` contains only binary data (0s and 1s).

## `isJagged(x)`

Returns a boolean indicating whether or not the array `x` is jagged / ragged (i.e., whether or not it has nested arrays of inconsistent length).

## `normalize(x)`

Identical to the `standardize` function. Returns a transformed copy of `x` in which the values have been converted to _z_-scores. In other words: `(x - mean(x)) / stdev(x)`

## `orthonormalize(x)`

Returns a transformed copy of a matrix or `DataFrame` `x` in which all of the columns have been made orthogonal to each other. (See: [Gram-Schmidt process](https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process)) This is particularly useful for generating random datasets with uncorrelated features.

## `pValue(a, b)`

Returns the _p_-value of two vectors using Welch's _t_-test. (See: [Welch's _t_-test](https://en.wikipedia.org/wiki/Welch's_t-test)) Note that this function returns results that are very, very close to [scipy's `ttest_ind` function](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html) when the latter is invoked this way:

```python
ttest_ind(a, b, equal_var=False, nan_policy="omit")
```

I'm not sure why there's a very slight variation in returned _p_-values between my version of the function and scipy's. It's possible that there's some subtle degrees-of-freedom difference in our implementations; or maybe they have a better way of computing the probability of _t_ (because mine uses a table of values and theirs may use a continuous function or whatever). However, after lots of testing, I feel pretty confident that these small differences are probably not significant. Let me know if you disagree, though. 😊

## `preprocess(df)`

Given a matrix or `DataFrame`, returns a cleaned-up matrix or `DataFrame` that contains only numbers and `null` values. The cleaning process involves:

- inferring the types of all columns and casting column values into those inferred types
- dropping all but 1 of any duplicate columns
- dropping any columns with fewer than 15 non-missing values
- dropping any columns with only 1 unique value
- one-hot-encoding any string columns where there are 7 or fewer unique values
- dropping all but 1 of any highly correlated columns (i.e., _r_ > `threshold` from the `getHighlyCorrelatedColumns` function)
- dropping all other columns that do not contain strings or numbers

## `project(v, u)`

Returns the projection of vector or `Series` `v` onto vector or `Series` `u`.

## `rScore(xTrue, xPred)`

Returns (roughly) the square root of the <i>R</i><sup>2</sup> value of `xTrue` versus `xPred`. Since <i>R</i><sup>2</sup> can be negative, the actual value returned is `sign(R^2) * sqrt(abs(R^2))`. The two datasets can be any shape provided that they have the same shape as each other.

## `sortCorrelationMatrix(c)`

Sorts a correlation matrix (array or `DataFrame`) so that variables near each other in the visualization are also highly correlated with one another. The first variable chosen is the one with the highest sum of squared correlations. The second variable chosen is the remaining variable most highly correlated with the first; the third variable chosen is the remaining variable most highly correlated with the second; and so on. This algorithm is called the Hunter chain method. (See: ["Methods of Reordering the Correlation Matrix to Vacilitate Visual Inspection and Preliminary Cluster Analysis" by John Edward Hunter](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1745-3984.1973.tb00782.x))

## `standardize(x)`

Identical to the `normalize` function.

# Notes

## Handling NaN values

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

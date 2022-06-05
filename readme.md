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

Clips all values in a vector `x` to the range [`median(x) - maxScore * MAD(x)`, `median(x) + maxScore * MAD(x)`]. (See: [MAD](https://en.wikipedia.org/wiki/Median_absolute_deviation)) Ignores `NaN` values (i.e., `NaN` are dropped before computing the median, MAD, etc., but are still returned as part of the transformed vector).

## `containsOnlyNumbers(x)`

Returns a boolean indicating whether `x` contains only numbers. In other words, if `x` contains strings, booleans, objects, or other types of non-numerical values, then the function will return `false`.

## `diagonalize(x)`

Turns vector `x` into a square matrix with the values of `x` along the main diagonal (top left to bottom right) and zeros everywhere else. For example:

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

Returns a correlation matrix containing the correlations of every column in `a` against every column in `b`. Ignores `NaN` values. If `b === null`, then `a` is just compared against itself.

## `getHighlyCorrelatedColumns(c)`

Returns a dictionary of columns and their highly correlated counterparts given a correlation matrix `c`. For example:

```js
const { DataFrame, normal, transpose } = require("@jrc03c/js-math-tools")

const {
  getCorrelationMatrix,
  getHighlyCorrelatedColumns,
} = require("@jrc03c/js-data-science-helpers")

// generate a single column of random data
const temp = normal(1000)

// put that column in a matrix along with a copy of that column plus a tiny
// bit of noise
const x = transpose([temp, temp.map(v => v + 0.0001 * normal())])

// get a correlation matrix from x
const c = getCorrelationMatrix(x)
console.log(c)
// [
//   [ 0.9999999999999998, 0.9999999951258355 ],
//   [ 0.9999999951258355, 1 ]
// ]

// turn the correlation matrix into a DataFrame with identical rows and column
// names (since it's symmetrical)
const df = new DataFrame(c)
df.columns = ["colA", "colB"]
df.index = ["colA", "colB"]

// get the list of highly correlated columns
const results = getHighlyCorrelatedColumns(df)
console.log(results)
// { colA: [ 'colB' ], colB: [ 'colA' ] }
```

## `getMagnitude(x)`

Returns the Euclidean length (i.e., the 2-norm) of `x`, which cannot include `NaN` values.

## `getOneHotEncodings(name, x)`

Given a vector `x` containing _n_ unique values, returns an dictionary with _n_-1 key-value pairs where each key is `name` + a unique value and each value is a vector of binary values indicating whether or not `x` matches that particular unique value. For example:

```js
const { getOneHotEncodings } = require("@jrc03c/js-data-science-helpers")
const x = [2, 2, 3, 4, 2, 4]
const encodings = getOneHotEncodings("foo", x)
console.log(encodings)
// foo_3  foo_4
//   0      0
//   0      0
//   1      0
//   0      1
//   0      0
//   0      1
// (but returned as a dictionary, of course)
```

## `getPValueMatrix(x)`

Returns a correlation matrix containing the _p_-values of every column in `a` against every column in `b`. Ignores `NaN` values. If `b === null`, then `a` is just compared against itself.

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

## `gramSchmidtOrthonormalize(x)`

Returns a mutated version of a matrix `x` in which all of the columns have been made orthogonal to each other. (See: [Gram-Schmidt process](https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process)) This is particularly useful for generating random data sets with completely uncorrelated features (i.e., by passing a randomly-generated matrix through the function).

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

First, "date" is not a data type in JS. There are `Date` objects, of course, but `typeof new Date()` returns "object". Since dates are commonly stored in data sets and because they come with their own particular set of challenges, I've set these apart as their own data type so that they won't be conflated with other kinds of objects.

Second, arrays are not among the inferrable types because `x` is assumed to be a vector, and allowing `x` to have arrays as values makes it difficult to determine whether `x` is supposed to be a vector, matrix, tensor, mixed data structure, etc. If you include an array as a value in `x`, you'll receive an error.

### Alternate values

It's pretty common for data sets to contain boolean-ish and null-ish values, by which I mean string values like "yes", "no", "NaN", "NONE", "undefined", "NA", etc., or even empty strings. Those values are sort of like boolean or null values, but they're not always consistent or suitable for immediate inference by something like the `JSON.parse` function. Therefore, the `inferTypes` function tries to look for such values. For example, if it encounters a string value like "YES", it counts that value as a boolean, _not_ as a string! In fact, counting a value as a string is the function's very last resort since it's so common for values to be included accidentally as strings. For example, if you use a library like [papaparse](https://www.papaparse.com/) to read a CSV file from disk, then the returned data may just be a matrix of strings and nothing more; i.e., it's probably pretty common for such libraries to avoid making inferences about the data, leaving such work up to the user. So, when the `inferTypes` function encounters a string value, it does its best to cast it into any other data type first; but if it fails to find any suitable type, it gives up and assumes that the value is just a plain ol' string. Here are the lists of boolean-ish and null-ish values that are parsed as booleans and nulls respectively (accounting for case sensitivity, of course):

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

This function doesn't cover every possible edge case, of course; it should probably only be expected to work on an average data set.

## `isBinary(x)`

Returns a boolean indicating whether or not `x` contains only binary data (0s and 1s). Ignores null / undefined values but does _not_ ignore other non-numerical values (e.g., strings, objects, etc.).

## `isJagged(x)`

Returns a boolean indicating whether or not the array `x` is jagged / ragged (i.e., whether or not it has nested arrays of inconsistent length).

## `normalize(x)`

Identical to the `standardize` function. Returns a transformed version of vector `x` in which the values have been converted to _z_-scores. In other words: `(x - mean(x)) / stdev(x)`

## `pValue(a, b)`

Returns the _p_-value of two vectors using Welch's _t_-test. (See: [Welch's _t_-test](https://en.wikipedia.org/wiki/Welch's_t-test)) Note that this function returns results that are very, very close to [scipy's `ttest_ind` function](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html) when the latter is invoked this way:

```python
ttest_ind(a, b, equal_var=False, nan_policy="omit")
```

I'm not sure why there's a very slight variation in returned _p_-values between my version of the function and scipy's. It's possible that there's some subtle degrees-of-freedom difference in our implementations; or maybe they have a better way of computing the probability of _t_ (because mine uses a table of values and theirs may use a continuous function or whatever). However, after lots of testing, I feel pretty confident that these small differences are probably not significant. Let me know if you disagree, though. :)

## `preprocess(df)`

Given a [`js-math-tools`](https://github.com/jrc03c/js-math-tools) `DataFrame`, returns a cleaned-up `DataFrame` that contains only numbers and `null` values. The cleaning process involves:

- inferring the types of all columns and casting column values into those inferred types
- dropping all but 1 of any duplicate columns
- dropping any columns with fewer than 15 non-missing values
- dropping any columns with only 1 unique value
- dropping string columns where _all_ values are unique (e.g., unique IDs, open-ended responses, etc.)
- one-hot-encoding any string columns where there are 7 or fewer unique values
- dropping all but 1 of any highly correlated columns (i.e., _r_ > 0.99)
- dropping all other columns that do not contain strings or numbers

## `project(v, u)`

Returns the projection of vector `v` onto vector `u`. Neither `u` nor `v` can include `NaN` values.

## `rScore(xTrue, xPred)`

Returns (roughly) the square root of the _R_<sup>2</sup> value of `xTrue` versus `xPred`. Since _R_<sup>2</sup> can be negative, the actual value returned is `sign(R^2) * sqrt(abs(R^2))`. Neither `xTrue` nor `xPred` can include `NaN` values. The two data sets can be any shape provided that they have the same shape as each other and are not jagged.

## `sortCorrelationMatrix(c)`

Sorts a correlation matrix so that variables near each other in the visualization are also highly correlated with one another. The first variable chosen is the one with the highest sum of squared correlations. The second variable chosen is the remaining variable most highly correlated with the first; the third variable chosen is the remaining variable most highly correlated with the second; and so on. This algorithm is called the Hunter chain method. (See: ["Methods of Reordering the Correlation Matrix to Vacilitate Visual Inspection and Preliminary Cluster Analysis" by John Edward Hunter](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1745-3984.1973.tb00782.x))

## `standardize(x)`

Identical to the `normalize` function.

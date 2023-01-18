const {
  argmin,
  distance,
  divide,
  max,
  random,
} = require("@jrc03c/js-math-tools")

const KMeansNaive = require("./k-means-naive")

class KMeansPlusPlus extends KMeansNaive {
  initializeCentroids(x) {
    // initialize centroids using the kmeans++ algorithm
    // 1) select a random point from the data to be the first centroid
    // 2) until we have k centroids:
    //    a) get all of the distances from each point to the closest centroid
    //    b) convert the distances to probabilities
    //    c) use the probabilities to randomly select a point to be the next
    //       centroid

    const self = this
    const centroids = [x[parseInt(random() * x.length)]]

    while (centroids.length < self.k) {
      const distances = x.map(p =>
        distance(p, centroids[argmin(centroids.map(c => distance(p, c)))])
      )

      const probabilities = divide(distances, max(distances))
      centroids.push(x[probabilities.findIndex(v => random() < v)])
    }

    return centroids
  }
}

module.exports = KMeansPlusPlus

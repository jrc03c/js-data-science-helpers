const {
  argmin,
  DataFrame,
  floor,
  max,
  random,
} = require("@jrc03c/js-math-tools")

const { getDistanceMatrix } = require("./helpers")
const KMeansNaive = require("./k-means-naive")

class KMeansMetaEstimated extends KMeansNaive {
  distancesCache = {}

  fit() {
    this.distancesCache = {}
    return super.fit(...arguments)
  }

  initializeCentroids(x) {
    if (x instanceof DataFrame) {
      x = x.values
    }

    const distances = (() => {
      if (this.distancesCache[x]) {
        return this.distancesCache[x]
      } else {
        const distances = getDistanceMatrix(x)
        this.distancesCache[x] = distances
        return distances
      }
    })()

    const dmax = max(distances)
    const radius = dmax / this.k
    const clusters = []

    x.forEach((p, i) => {
      const distancesRow = distances[i]

      if (clusters.length === 0) {
        clusters.push([p])
      } else {
        const tempDistances = clusters.map(
          cluster =>
            distancesRow[x.indexOf(cluster[floor(random() * cluster.length)])]
        )

        const index = argmin(tempDistances)
        const d = tempDistances[index]

        if (d < radius || clusters.length >= this.k) {
          clusters[index].push(p)
        } else {
          clusters.push([p])
        }
      }
    })

    return clusters.map(cluster => cluster[floor(random() * cluster.length)])
  }
}

module.exports = KMeansMetaEstimated

import ImageSearchApis from './third-party/image-apis'
import _ from 'lodash'

export const ORIENTATION = {
  landscape: 'landscape',
  portait: 'portait',
}

/**
 * @typedef {Object} ImageSearchResult
 * @property {array} images - Image object list
 * @property {number} total - Total Image count from all apis
 * @property {function} fetchMore - Use it to fetch more images
 */
/**
 * Search images from third party apis
 * For fetching more results use async fetchMore
 * @param query string Query
 * @param orientation {('portrait'|'landscape')} Orientation of image
 * @return ImageSearchResult
 */
export async function search({query, orientation}) {
  return _search({query, orientation})
}

async function _search({query, fetchMores, orientation}) {
  // If it's subsequent call use fetch more functions
  const apis = fetchMores ? fetchMores : ImageSearchApis
  const allResults = await Promise.allSettled(apis.map((f, i) => f.apply(null, [{query, orientation}])))
  // Remove errored responses
  const results = allResults.map(r => r.status === 'fulfilled' && r.value)
  // Filter out apis without results
  const compactResults = _.compact(results)

  const images = _.flatten(compactResults.map(r => r.images))
  const total = compactResults.reduce((sum, r) => sum + r.total, 0)
  const newFetchMores = _.compact(results.map(result => result && result.fetchMore))
  const fetchMore = async () => _search({query, fetchMores: newFetchMores, orientation})

  return {
    images,
    total,
    fetchMore
  }
}

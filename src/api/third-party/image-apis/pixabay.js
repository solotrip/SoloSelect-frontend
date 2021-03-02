import axios from 'axios'
import _ from 'lodash'

const API_URL = 'https://pixabay.com/api/'
const API_KEY = '20418752-e3e3921739fc8a8e4774086f5'

export const COLOR = {
  grayscale: 'grayscale',
  black: 'black',
  white: 'white',
  yellow: 'yellow',
  orange: 'orange',
  red: 'red',
  green: 'green',
  transparent: 'transparent',
  turquoise: 'turquoise',
  lilac: 'lilac',
  pink: 'pink',
  gray: 'gray',
  brown: 'brown'
}

export const CATEGORY = {
  backgrounds: 'backgrounds',
  fashion: 'fashion',
  nature: 'nature',
  science: 'science',
  education: 'education',
  feelings: 'feelings',
  health: 'health',
  people: 'people',
  religion: 'religion',
  places: 'places',
  animals: 'animals',
  industry: 'industry',
  computer: 'computer',
  food: 'food',
  sports: 'sports',
  transportation: 'transportation',
  travel: 'travel',
  buildings: 'buildings',
  business: 'business',
  music: 'music'
}

const ORIENTATION = {
  landscape: 'horizontal',
  portrait: 'vertical',
  default: 'all'
}

function _mapParams(params = {}) {
  return {
    ...params,
    orientation: _.get(ORIENTATION, params.orientation, ORIENTATION.default)
  }
}

export async function search(params = {}) {
  const {query, page = 1, perPage = 30, ...rest} = params
  const response = await axios.get(API_URL, {
    params: {
      key: API_KEY,
      q: query,
      page,
      per_page: perPage,
      image_type: 'photo',
      ..._mapParams(rest)
    }
  })

  const images = response.data.hits.map((h) => ({
    provider: 'pixabay',
    sourceLink: h.pageURL,
    previewUrl: h.previewURL,
    previewWidth: h.previewWidth,
    previewHeight: h.previewHeight,
    authorName: h.user,
    authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
    url: h.largeImageURL,
    height: h.imageHeight > h.imageWidth ? 1280 : Math.floor(1280 / h.imageWidth * h.imageHeight),
    width: h.imageWidth > h.imageHeight ? 1280 : Math.floor(1280 / h.imageHeight * h.imageWidth),
  }))
  const hasMore = perPage * page < response.data.total
  return {
    images,
    total: response.data.total,
    fetchMore: hasMore && (async () => search({query, page: page + 1, ...(rest || {})}))
  }
}

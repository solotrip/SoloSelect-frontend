import axios from 'axios'

const API_URL = 'https://api.unsplash.com/search/photos'
const CLIENT_ID = 'Dypv6rvXkdydlkGSZB0NMzZsCcPrfuYPAE9aJZAcxoI'

export const ORIENTATION = {
  landscape: 'landscape',
  portait: 'portait',
  squarish: 'squarish',
}

export const COLOR = {
  blackAndWhite: 'black_and_white',
  black: 'black',
  white: 'white',
  yellow: 'yellow',
  orange: 'orange',
  red: 'red',
  purple: 'purple',
  magenta: 'magenta',
  green: 'green',
  teal: 'teal',
  blue: 'blue'
}


export async function search(params = {}) {
  const {query, page = 1, perPage = 30, ...rest} = params
  const response = await axios.get(API_URL, {
    params: {
      client_id: CLIENT_ID,
      query,
      page,
      per_page: perPage,
      ...rest
    }
  })
  const images = response.data.results.map((h) => ({
    provider: 'unsplash',
    sourceLink: h.links.html,
    previewUrl: h.urls.thumb,
    previewWidth: h.previewWidth,
    previewHeight: h.previewHeight,
    authorName: h.user.name,
    authorUrl: h.user.links.html,
    url: h.urls.raw,
    width: h.width,
    height: h.height,
    description: h.alt_description,
  }))
  const hasMore = perPage * page < response.data.total
  return {
    images,
    total: response.data.total,
    fetchMore: hasMore && (async () => search({query, page: page + 1, ...rest}))
  }
}

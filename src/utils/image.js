export function getImageUrl (key, transformations = {}) {
  const { height, width, smartCrop } = transformations
  const transformationList = []
  if (height) {
    transformationList.push(`h-${height}`)
  }
  if (width) {
    transformationList.push(`w-${width}`)
  }
  if (smartCrop) {
    transformationList.push('fo-auto')
  }
  const transformationString = transformationList.length > 0 ? `tr:${transformationList.join(',')}/` : ''

  return process.env.REACT_APP_SS_IMG_BASE_URL + transformationString  + key
}

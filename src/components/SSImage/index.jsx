import React from 'react'
import PropTypes from 'prop-types'
import { Image } from 'semantic-ui-react'
import { getImageUrl } from '../../utils/image'

const SSImage = ({ image, smartCrop, width, height, preferredUrlKey, ...rest }) => {

  const src = image.key ?
    getImageUrl(image.key, {
      width,
      height,
      smartCrop
    }) : preferredUrlKey ? image[preferredUrlKey] : image.previewUrl
  return (
    <Image src={src} {...rest}/>
  )
}

SSImage.propTypes = {
  image: PropTypes.object,
  smartCrop: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  preferredUrlKey: PropTypes.string
}

export default SSImage

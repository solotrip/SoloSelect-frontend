import React, { useCallback, useState } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import { Card, Container, Header, Input } from 'semantic-ui-react'
import ImagesContainer from '../../containers/ImagesContainer'
import SelectedImagePreview from '../SelectedImagePreview'
import SSImage from '../SSImage'

const Area = ({ area, images, onUpdate, onRemove }) => {
  const [query, setQuery] = useState(`${area.names.name_en}`)
  const [inputValue, setInputValue] = useState(`${area.names.name_en}`)

  const headerImage = _.get(area, 'images.header')
  const cardImage = _.get(area, 'images.card')
  const galleryImages = _.get(area, 'images.gallery', [])
  const galleryImageComponents = React.useMemo(() => galleryImages.map(image => (
      <SelectedImagePreview
        title='Gallery'
        image={image}
        onRemove={onRemove('gallery', image.key)}
      />)),
    [galleryImages, onRemove]
  )
  const handleQueryUpdate = useCallback((e) => {
    setQuery(inputValue)
  }, [setQuery, inputValue])

  return (
    <div>
      <div className=''>
        {headerImage &&
        <SSImage className={styles.headerImage} width={1920} height={400} smartCrop image={headerImage}
                 preferredUrlKey='url'/>}
      </div>
      <div className={styles.name}>
        <Header as='h1'>{area.names.name_en}, {area.country.name}</Header>
        <Header.Subheader>{area.names.description_en}</Header.Subheader>
        <Input
          type='text'
          label='Query'
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          action={{
            content: 'Update',
            positive: true,
            onClick: handleQueryUpdate
          }}/>
      </div>
      <div>
        <Container>
          <Card.Group itemsPerRow={4}>
            {headerImage &&
            <SelectedImagePreview title='Header' image={headerImage} onRemove={onRemove('header', headerImage.key)}/>}
            {cardImage &&
            <SelectedImagePreview title='Card' image={cardImage} onRemove={onRemove('card', cardImage.key)}/>}
            {galleryImages.length > 0 && galleryImageComponents}
          </Card.Group>
        </Container>

      </div>

      <ImagesContainer query={query} filterOutImages={images} onUpdate={onUpdate}/>
    </div>
  )
}

Area.propTypes = {
  area: PropTypes.object,
  images: PropTypes.object
}

export default Area

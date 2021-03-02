import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card } from 'semantic-ui-react'
import styles from './styles.module.scss'
import SSImage from '../SSImage'

const SelectedImagePreview = ({ title, image, onRemove }) => {
  return (
    <Card key={`image-${image.previewUrl}`}>
      <Card.Content>
        <SSImage floated='right' size='tiny' image={image} height={100} width={100} smartCrop className={styles.image}/>
        <Card.Header>
          {title}
        </Card.Header>
        <Card.Meta>
          {image.width}x{image.height}
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <div className='ui three buttons'>
          <Button basic onClick={onRemove} negative icon='close'>
            Remove
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}

SelectedImagePreview.propTypes = {
  title: PropTypes.string,
  image: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired
}

export default SelectedImagePreview

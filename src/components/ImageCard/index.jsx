import React from 'react';
import PropTypes from 'prop-types';
import {Button, Card, Image} from "semantic-ui-react";
import styles from './styles.module.scss'

const ImageCard = ({image, onSelect, gallerySelected, cardSelected, headerSelected}) => {
  return (
    <Card key={`image-${image.previewUrl}`}>
      <Image src={image.previewUrl} className={styles.image}/>
      <Card.Content>
        <Card.Description>
          {image.description}
        </Card.Description>
        <Card.Meta>
          {image.width}x{image.height}
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <div className='ui three buttons'>
          <Button basic toggle active={headerSelected} onClick={onSelect('header')}>
            Header
          </Button>
          <Button basic toggle active={cardSelected}  onClick={onSelect('card')}>
            Card
          </Button>
          <Button basic toggle active={gallerySelected} onClick={onSelect('gallery')}>
            Gallery
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
};

ImageCard.propTypes = {
  image: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  cardSelected: PropTypes.bool,
  headerSelected: PropTypes.bool,
  gallerySelected: PropTypes.bool
};

export default ImageCard;

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import { Button, Image } from 'semantic-ui-react'

const HeaderImagePreview = ({ image, onClose, onSave }) => {
  return ReactDOM.createPortal(
    image && (
      <div className={styles.preview}>
        <Image src={image.url} className={styles.image}/>
        <Button icon='save' onClick={onSave} className={styles.selectButton} positive
                content='Save as Header'/>
        <Button inverted icon='close' onClick={onClose} className={styles.closeButton}/>
      </div>)
    , document.body)
}

HeaderImagePreview.propTypes = {
  image: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
}

export default HeaderImagePreview

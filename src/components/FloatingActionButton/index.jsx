import React from 'react'
import { Button } from 'semantic-ui-react'
import styles from './styles.module.scss'

const FloatingActionButton = (props) => {

  return (
    <div className={styles.container}>
      <Button {...props}/>
    </div>
  )
}

FloatingActionButton.propTypes = {}

export default FloatingActionButton

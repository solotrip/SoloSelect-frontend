import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Confirm} from "semantic-ui-react";
import styles from './styles.module.scss'

const SelectNavigation = ({loading, onNext, onReset}) => {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const openConfirmation = useCallback(async () => {
    setShowConfirmation(true)
  }, [])

  const closeConfirmation = useCallback(async () => {
    setShowConfirmation(false)
  }, [])

  const handleReset = useCallback(async () => {
    closeConfirmation()
    onReset()
  }, [onReset, closeConfirmation])

  return (
    <div className={styles.container}>
      <Button loading={loading} onClick={openConfirmation} secondary>Reset</Button>
      <Confirm
        content='This will reset the cursor to the start of areas again. Do you want to proceed?'
        open={showConfirmation}
        onCancel={closeConfirmation}
        onConfirm={handleReset}
      />
      <Button loading={loading} onClick={onNext} primary>Next</Button>
    </div>
  );
};

SelectNavigation.propTypes = {
  loading: PropTypes.bool,
  onNext: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default SelectNavigation;

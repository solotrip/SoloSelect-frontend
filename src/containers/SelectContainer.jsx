import React, { useCallback, useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import * as AreasApi from '../api/areas'
import SelectNavigation from '../components/SelectNavigation'

const initialState = {
  loading: true,
  area: null,
  sidList: [],
  resetConfirmationOpen: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'NEXT_INIT':
      return { ...state, loading: true }
    case 'NEXT_SUCCESS':
      return {
        ...state,
        loading: false,
        area: action.area,
        sidList: [...state.sidList, action.area.sid]
      }
    case 'OPEN_RESET_CONFIRMATION':
      return { ...state, resetConfirmationOpen: true }
    case 'CLOSE_RESET_CONFIRMATION':
      return { ...state, resetConfirmationOpen: false }
    default:
      return state
  }
}

const SelectContainer = ({ onNext }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleNext = useCallback(async () => {
    dispatch({ type: 'NEXT_INIT' })
    const nextArea = await AreasApi.next()
    onNext(nextArea)
    dispatch({ type: 'NEXT_SUCCESS', area: nextArea })
  }, [onNext])

  const handleReset = useCallback(async () => {
    dispatch({ type: 'NEXT_INIT' })
    await AreasApi.resetCursor()
    handleNext()
  }, [handleNext])

  useEffect(() => {
    handleReset()
  },[])

  return (
    <SelectNavigation onReset={handleReset} onNext={handleNext} loading={state.loading}/>
  )
}

SelectContainer.propTypes = {
  onNext: PropTypes.func.isRequired
}

export default SelectContainer

import React, { useCallback, useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import flatten, { unflatten } from 'flat'
import * as AreasApi from '../api/areas'
import { Loader } from 'semantic-ui-react'
import SelectContainer from './SelectContainer'
import Area from '../components/Area'
import FloatingActionButton from '../components/FloatingActionButton'

const initialState = {
  loading: true,
  area: null,
  images: {},
  fetchingImages: true,
  updates: {},
  saving: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'CLEAR':
      return initialState
    case 'SET_SID':
      return { ...initialState, sid: action.sid }
    case 'AREA_SUCCESS':
      return { ...state, loading: false, area: action.area }
    case 'AREA_IMAGES_SUCCESS':
      return { ...state, loading: false, images: action.images }
    case 'FETCH_AREA_IMAGES_INIT':
      return {
        ...state,
        fetchingImages: true,
      }
    case 'FETCH_AREA_IMAGES_SUCCESS':
      return {
        ...state,
        fetchingImages: false,
        images: _.keyBy(action.images, 'url')
      }
    case 'UPDATE':
      return {
        ...state,
        updates: { ..._.set(state.updates, action.key, action.data) }
      }
    case 'UPDATE_REMOVE_KEY':
      // Remove all parent properties as well if the value is removed
      const flatUpdates = flatten(_.set(state.updates, action.key, null))
      delete flatUpdates[action.key]
      return {
        ...state,
        updates: unflatten(flatUpdates, { object: true })
      }
    case 'REMOVE':
      const areaImages = action.imageType === 'gallery' ?
        { ...state.area.images, gallery: state.area.images.gallery.filter(i => i.key !== action.key) } :
        { ..._.omit(state.area.images, action.imageType) }
      return {
        ...state,
        // also remove from selected images
        images: { ..._.omit(state.images, action.key) },
        area: { ...state.area, images: areaImages }
      }
    case 'SAVE_INIT':
      return {
        ...state,
        saving: true,
      }
    case 'SAVE_SUCCESS':
      const newImages = _.compact([
        ..._.get(action.updates, 'images.gallery', []),
        _.get(action.updates, 'images.card'),
        _.get(action.updates, 'images.header'),
      ])

      return {
        ...state,
        saving: false,
        area: _.merge({}, state.area, action.updates),
        images: {...state.images, ..._.keyBy(newImages, 'url')}

      }
    default:
      return state
  }
}

const AreaContainer = ({ sid, toolMode }) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState, sid })

  const handleSave = useCallback(async () => {
    if (!_.isEmpty(state.updates)) {
      dispatch({ type: 'SAVE_INIT' })
      await AreasApi.updateArea(state.sid, state.updates)
      dispatch({ type: 'SAVE_SUCCESS', updates: state.updates })
    }
  }, [state.sid, state.updates])

  const handleNext = useCallback(async (nextArea) => {
    await handleSave()
    dispatch({ type: 'SET_SID', sid: nextArea.sid })
  }, [handleSave])

  useEffect(() => {
    const fetchData = async () => {
      // Parallel fetch both data
      const [area, images] = await Promise.all([AreasApi.get(state.sid), AreasApi.getAreaImages(state.sid)])
      dispatch({ type: 'AREA_SUCCESS', area })
      dispatch({ type: 'FETCH_AREA_IMAGES_SUCCESS', images })
    }
    if (state.sid) {
      fetchData()
    }
  }, [state.sid])

  const onUpdate = useCallback((key, data) => {
    // ImagesContainer calls it initially with images.gallery, []
    // If the there is no images selected do not try to update gallery field
    if ((key === 'images.gallery' && _.isEmpty(data)) || data === 'undefined') {
      dispatch({ type: 'UPDATE_REMOVE_KEY', key })
    } else {
      dispatch({ type: 'UPDATE', key, data })
    }
  }, [])

  const handleRemove = useCallback((type, key) => async () => {
    await AreasApi.removeImage(state.sid, type, key)
    dispatch({ type: 'REMOVE', key, imageType: type })
  }, [state.sid])

  return (
    <>
      {state.loading ? <Loader/> : <Area area={state.area} images={state.images} onUpdate={onUpdate}
                                         onRemove={handleRemove}/>}
      {toolMode && <SelectContainer onNext={handleNext}/>}
      {!toolMode &&
      <FloatingActionButton
        onClick={handleSave}
        disabled={_.isEmpty(state.updates)}
        circular positive
        icon='save'
        size='huge'
        loading={state.saving}
      />}
    </>
  )
}

AreaContainer.propTypes =
  {
    sid: PropTypes.string,
    toolMode: PropTypes.bool
  }

export default AreaContainer

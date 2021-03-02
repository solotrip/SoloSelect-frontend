import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { search } from '../api/image-search'
import { Button, Card, Container, Divider, Input, Loader } from 'semantic-ui-react'
import ImageCard from '../components/ImageCard'
import HeaderImagePreview from '../components/HeaderImagePreview'

const initialState = {
  query: '',
  loading: true,
  images: [],
  total: 0,
  fetchingMore: false,
  fetchMore: null,
  orientation: undefined,
  preview: null,
  headerPreviewIndex: -1,
  selectedIndexes: {},
  selectedHeaderIndex: -1,
  selectedCardIndex: -1,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'CLEAR':
      return initialState
    case 'SET_QUERY':
      return { ...initialState, query: action.query }
    case 'SEARCH_SUCCESS':
      return {
        ...initialState,
        loading: false,
        images: action.result.images,
        total: action.result.total,
        fetchMore: action.result.fetchMore
      }
    case 'FETCH_MORE_INIT':
      return {
        ...state,
        fetchingMore: true
      }
    case 'FETCH_MORE_SUCCESS':
      return {
        ...state,
        fetchingMore: false,
        images: state.images.concat(action.result.images),
        fetchMore: action.result.fetchMore
      }
    case 'SET_PREVIEW':
      return { ...state, headerPreviewIndex: action.index }
    case 'RESET_PREVIEW':
      return { ...state, headerPreviewIndex: -1 }
    case 'TOGGLE_SELECTED':
      return {
        ...state,
        selectedIndexes: { ...state.selectedIndexes, [action.index]: !state.selectedIndexes[action.index] }
      }
    case 'TOGGLE_SELECTED_HEADER':
      return { ...state, selectedHeaderIndex: state.selectedHeaderIndex === action.index ? -1 : action.index }
    case 'TOGGLE_SELECTED_CARD':
      return { ...state, selectedCardIndex: state.selectedCardIndex === action.index ? -1 : action.index }
    default:
      return state
  }
}

const ImagesContainer = ({ query, filterOutImages, onUpdate }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const fetchData = async () => {
      const result = await search({ query, orientation: state.orientation })
      dispatch({ type: 'SEARCH_SUCCESS', result })
    }
    if (query !== '') {
      fetchData()
    }
  }, [query, state.orientation])

  const handleFetchMore = useCallback(async () => {
    dispatch({ type: 'FETCH_MORE_INIT' })
    const func = state.fetchMore
    const result = await func()
    dispatch({ type: 'FETCH_MORE_SUCCESS', result })
  }, [state.fetchMore])

  const handleSetPreview = useCallback((index) => {
    dispatch({ type: 'SET_PREVIEW', index })
  }, [])

  const handleResetPreview = useCallback(() => {
    dispatch({ type: 'RESET_PREVIEW' })
  }, [])

  const handleHeaderSelect = useCallback((index) => () => {
    if (index === state.selectedHeaderIndex) {
      // Remove selected header
      onUpdate('images.header', undefined)
    } else {
      onUpdate('images.header', state.images[index])
    }
    handleResetPreview()
    dispatch({ type: 'TOGGLE_SELECTED_HEADER', index })
  }, [onUpdate, handleResetPreview, state.selectedHeaderIndex, state.images])

  const handleSelectImage = useCallback((index) => (type) => () => {
    switch (type) {
      case 'header':
        // deselect header
        if (index === state.selectedHeaderIndex) {
          handleHeaderSelect(index)()
        } else {
          handleSetPreview(index)
        }
        break
      case 'card':
        if (index === state.selectedCardIndex) {
          // Remove selected header
          onUpdate('images.card', undefined)
        } else {
          onUpdate('images.card', state.images[index])
        }
        dispatch({ type: 'TOGGLE_SELECTED_CARD', index })
        break
      case 'gallery':
        dispatch({ type: 'TOGGLE_SELECTED', index })
        break
      default:
    }
  }, [onUpdate, handleSetPreview, state.images,
    state.selectedCardIndex, state.selectedHeaderIndex, handleHeaderSelect])

  useEffect(() => {
    const indexes = _.pickBy(state.selectedIndexes, _.identity)
    const data = Object.keys(indexes).map(index => state.images[index])
    onUpdate('images.gallery', data)
  }, [state.selectedIndexes, state.images, onUpdate])



  // Don't displayed filtered out images. We do not use .filter() to keep indexes same with state
  const imageList = useMemo(() => state.images
  .map((image, index) => filterOutImages[image.url] ? null : (
    <ImageCard
      key={`card-${image.url}`}
      image={image}
      onSelect={handleSelectImage(index)}
      gallerySelected={!!state.selectedIndexes[index]}
      headerSelected={index === state.selectedHeaderIndex}
      cardSelected={index === state.selectedCardIndex}
    />
  )), [
    state.images, handleSelectImage, state.selectedIndexes,
    filterOutImages, state.selectedHeaderIndex, state.selectedCardIndex])

  if (state.loading) {
    return (<Loader/>)
  }
  return (
    <Container>
      <Card.Group itemsPerRow={3}>
        {imageList}
      </Card.Group>
      {state.fetchMore &&
      <>
        <Divider/>
        <Button fluid onClick={handleFetchMore} loading={state.fetchingMore} content='Fetch More'/>
        <Divider/>
      </>}
      <HeaderImagePreview
        image={state.headerPreviewIndex !== -1 ? state.images[state.headerPreviewIndex] : null}
        onClose={handleResetPreview}
        onSave={handleHeaderSelect(state.headerPreviewIndex)}/>
    </Container>
  )
}

ImagesContainer.propTypes = {
  /**
   * Search query for finding images
   */
  query: PropTypes.string.isRequired,
  /**
   * List of images to be excluded from result list
   */
  filterOutImages: PropTypes.object,
  /**
   * Callback for image selection
   */
  onUpdate: PropTypes.func,
}

export default ImagesContainer

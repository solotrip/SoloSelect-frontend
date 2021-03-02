import React, { useCallback, useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import { autocomplete } from '../api/areas'
import { Search } from 'semantic-ui-react'

const initialState = {
  loading: false,
  results: [],
  query: ''
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'CLEAR':
      return initialState
    case 'SEARCH_INIT':
      return { ...state, loading: true, query: action.query }
    case 'SEARCH_SUCCESS':
      return { ...state, loading: false, results: action.results }
    default:
      return state
  }
}

const AutocompleteContainer = ({ onSelect }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const history = useHistory()

  const handleSearch = useCallback(async (e, data) => {
    if (data.value === '') {
      dispatch({ type: 'CLEAR' })
    } else {
      dispatch({ type: 'SEARCH_INIT', query: data.value })
      const response = await autocomplete(data.value)
      const results = response.map(r => ({ ...r, title: `${r.name}, ${r.country}` }))
      dispatch({ type: 'SEARCH_SUCCESS', results })
    }
  }, [])

  const handleSelect = useCallback((e, data) => {
    if (onSelect) {
      onSelect(data.result)
    } else {
      // default case
      history.push(`/area/${data.result.sid}`)
    }
  }, [history, onSelect])

  return (
    <Search
      input={{ icon: 'search', iconPosition: 'left' }}
      onSearchChange={handleSearch}
      value={state.query}
      results={state.results}
      minCharacters={3}
      onResultSelect={handleSelect}
    />
  )
}

AutocompleteContainer.propTypes =
  {
    onSelect: PropTypes.func
  }

export default AutocompleteContainer

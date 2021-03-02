import React from 'react'
import { useParams } from 'react-router-dom'
import AutocompleteContainer from '../containers/AutocompleteContainer'
import AreaContainer from '../containers/AreaContainer'

const AreaPage = () => {
  const { sid } = useParams()
  return (
    <>
      <div className="fixedSearch"><AutocompleteContainer/></div>
      {sid && <AreaContainer sid={sid}/>}
    </>
  )
}


export default AreaPage

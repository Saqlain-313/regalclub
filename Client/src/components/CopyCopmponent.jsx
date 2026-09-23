import React from 'react'
import { GiCheckMark } from 'react-icons/gi'

const CopyCopmponent = ({copyPopup,message}) => {
  return (
    <>
         <div className={`copy-popup ${copyPopup ? "active" : ""}`}>
        <GiCheckMark />
        <div>{message} </div>
      </div>
    </>
  )
}

export default CopyCopmponent

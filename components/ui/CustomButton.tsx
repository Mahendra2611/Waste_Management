import React from 'react'

const CustomButton = ({text,handleClick}) => {
  return (
    <div>
      <button onClick={handleClick} className='bg-[#84c720] rounded-lg text-sm md:text-lg shadow[inset_5px_5px_5px_-1px_#538011,inset_-5px_-5px_5px_-1px_#afff36]'>{text}</button>
    </div>
  )
}

export default CustomButton

import React from 'react'

interface loaderProps {
    isLoading : boolean,
    text : string
}

const Loader = ({isLoading, text} : loaderProps) => {
  return (
    <>
    {
    isLoading ?
    <div className="flex flex-row gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 animate-bounce"></div>
    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 animate-bounce [animation-delay:-.3s]"></div>
    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 animate-bounce [animation-delay:-.5s]"></div>
    </div>
    : 
    <p>{text}</p>
    }
    </>
  )
}

export default Loader
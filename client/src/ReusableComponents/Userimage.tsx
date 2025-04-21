import React from 'react'
import { useAuthContext } from '../Auth/AuthProvider'

interface Props{
    width : number,
    height : number,
    size : number,
    firstname? : string | null,
    lastname? : string | null,
    className? : string,
    image? : string
}

const Userimage = ({width, height, size, firstname, lastname, className, image} : Props) => {
    const {user} = useAuthContext();
  return (
    <div>
        {
            image ? <img src={image} alt="profile-image" className={className} />
            :
            <div style={{width: `${width}px`, height: `${height}px`}} className={className}>
                <p className='text-gray-500' style={{fontSize: `${size}px`}}>{firstname && firstname[0]}</p>
                <p className='text-gray-500' style={{fontSize: `${size}px`}}>{lastname && lastname[0]}</p>
            </div>
        }
    </div>
  )
}

export default Userimage
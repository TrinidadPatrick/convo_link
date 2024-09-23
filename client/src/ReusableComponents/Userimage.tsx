import React from 'react'
import { useAuthContext } from '../Auth/AuthProvider'

interface Props{
    width : number,
    height : number,
    size : number,
    firstname? : string | null,
    lastname? : string | null
}

const Userimage = ({width, height, size, firstname, lastname} : Props) => {
    const {user} = useAuthContext();
  return (
    <div>
        {
            user?.profileImage ? <img src={user.profileImage} alt="profile-image" className={`w-${width} h-${height} rounded-full`} />
            :
            <div style={{width: `${width}px`, height: `${height}px`}} className={`flex rounded-full items-center justify-center aspect-square bg-gray-200 border border-gray-400`}>
                <p className='text-gray-500' style={{fontSize: `${size}px`}}>{firstname && firstname[0]}</p>
                <p className='text-gray-500' style={{fontSize: `${size}px`}}>{lastname && lastname[0]}</p>
            </div>
        }
    </div>
  )
}

export default Userimage
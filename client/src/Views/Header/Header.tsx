import React from 'react'
import Userimage from '../../ReusableComponents/Userimage'
import Logo from '../../utilities/images/Logo.png'
import { useAuthContext } from '../../Auth/AuthProvider';

const Header = () => {
    const {user} = useAuthContext();
  return (
    <main className='px-5'>
    <header className='flex items-center justify-between py-3 px-8 bg-white border-b border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
            <img src={Logo} alt="logo" className='h-8' />
        </div>
        {/* User image */}
        <div className='flex items-center gap-3'>
            <div className='flex flex-col items-end'>
                <p className='text-sm font-medium text-gray-600'>{user?.firstname} {user?.lastname}</p>
                <p className={`text-xs font-medium ${user?.profile_status == 'Offline' ? 'text-gray-600' : 'text-theme_semidark'}`}>{user?.profile_status}</p>  
            </div>
            <Userimage firstname={user?.firstname} lastname={user?.lastname} size={15} width={35} height={35} />
        </div>
    </header>
    </main>
  )
}

export default Header
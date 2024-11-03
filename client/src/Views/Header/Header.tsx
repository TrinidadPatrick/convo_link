import React, { useState } from 'react'
import Userimage from '../../ReusableComponents/Userimage'
import Logo from '../../utilities/images/Logo.png'
import { useAuthContext } from '../../Auth/AuthProvider';
import Dropdown from '../../ReusableComponents/Dropdown';
import http from '../../../http';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const {user} = useAuthContext();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState<boolean>(false)

    const logout = async () => {
        try {
            const result = await http.get('logout', {withCredentials: true})
            setTimeout(() => {
                window.location.reload()
            }, 500);
        } catch (error : any) {
            console.log(error)
        }
    }
  return (
    <main className=''>
    <header className='flex items-center justify-between py-3 px-3 sm:px-8 bg-white border-b border-gray-200 shadow-sm'>
        <div onClick={()=>navigate("/")} className='flex cursor-pointer items-center gap-3'>
            <img src={Logo} alt="logo" className='h-8' />
        </div>
        {/* User image */}
        <div className='flex items-center gap-3'>
            <div className=' hidden semiSm:flex flex-col items-end'>
                <p className='text-sm font-medium text-gray-600'>{user?.firstname} {user?.lastname}</p>
                <p className={`text-xs font-medium ${user?.profile_status == 'Offline' ? 'text-gray-600' : 'text-theme_semidark'}`}>{user?.profile_status}</p>  
            </div>
            <button onClick={()=>setShowDropdown(!showDropdown)} className='relative'>
                <Userimage firstname={user?.firstname} lastname={user?.lastname} size={15} width={35} height={35} />
                {/* Dropdown */}
                {
                    showDropdown &&
                    <div className='absolute right-2 top-10 z-50'>
                    <Dropdown 
                    items={
                        [
                        {
                        item : `${user?.firstname} ${user?.lastname}`, 
                        event: ()=>{}, fontSize: 12, fontColor: 'gray', fontWeight: 500,
                        icon : ''
                        },
                        {
                            item : `My Profile`, 
                            event: ()=>{}, fontSize: 12, fontColor: 'gray', fontWeight: 500,
                            icon : <span className="icon-[iconamoon--profile] text-gray-400"></span>
                        },
                        {
                            item : `Chats`, 
                            event: ()=>{}, fontSize: 12, fontColor: 'gray', fontWeight: 500,
                            icon : <span className="icon-[fluent--chat-12-regular] text-gray-400"></span>
                        },
                        {
                            item : `Find friends`, 
                            event: ()=>{navigate('/findPeople')}, fontSize: 12, fontColor: 'gray', fontWeight: 500,
                            icon : <span className="icon-[la--user-friends] text-gray-400"></span>
                        },
                        {
                            item : `Logout`, 
                            event: ()=>{logout()}, fontSize: 12, fontColor: 'red', fontWeight: 500,
                            icon : <span className="icon-[ri--logout-circle-r-line] text-red-500"></span>
                        },
                        ]
                        } />
                </div>
                }
            </button>
           
        </div>
    </header>
    </main>
  )
}

export default Header
import React, { useEffect, useRef, useState } from 'react'
import http from '../../../http'
import Friends from './Friends'
import FriendRecommendationStore from '../../store/FriendRecommendationStore'
import Userimage from '../../ReusableComponents/Userimage'
import { useAuthContext } from '../../Auth/AuthProvider'
import onlineUserStore from '../../store/OnlineUsersStore'
import FriendsStore from '../../store/FriendsStore'
import { useNavigate } from 'react-router-dom'
import ShowUserInfo from '../../ReusableComponents/ShowUserInfo'

interface People {
  _id: string
  firstname: string,
  lastname: string,
  profileImage: string,
  userBio: string,
  profile_status: string
}

const FriendLists = () => {
  const { user } = useAuthContext();
  let hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { onlineUsers } = onlineUserStore();
  const { Friends, setFriends } = FriendsStore();
  const [hoveredUser, setHoveredUser] = useState<any>(null)
  const [searchValue, setSearchValue] = useState<string>('')

  const getFriends = async (searchValue: string) => {
    try {
      const result = await http.get('getFriends?searchValue=' + searchValue, { withCredentials: true })
      setFriends(result.data.friends)
    } catch (error: any) {
      console.log(error)
    }
  }

  useEffect(() => {
    getFriends('')
    return () => {
    }
  }, [])

  const handleHover = (user: any, isOnline: boolean) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
  
    hoverTimeout.current = setTimeout(() => {
      setHoveredUser({ userInfo: user, isOnline });
    }, 1200);
  };

  const handleRemoveHover = () => {
    setHoveredUser(null)
  }

  const handleHoverLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-green-50 pt-20'>
      {hoveredUser && <ShowUserInfo user={hoveredUser} handleRemoveHover={handleRemoveHover} />}
      
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-800 mb-2'>My Friends</h1>
          <p className='text-slate-600 text-lg'>Connect with your friends and start conversations</p>
        </div>

        {/* Search Container */}
        <div className='relative mb-8 max-w-md'>
          <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            onKeyDown={(e) => { if (e.key == 'Enter') { getFriends(searchValue) } }}
            onChange={(e: any) => setSearchValue(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-green-100 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 shadow-sm hover:shadow-md"
            name="search"
            type="text"
          />
        </div>

        {/* Friends Grid or Empty State */}
        {Friends?.length == 0 ? (
          <div className='flex flex-col items-center justify-center gap-6 w-full h-96 bg-white rounded-3xl shadow-lg border border-green-100'>
            <div className='text-6xl opacity-30'>👥</div>
            <h2 className='text-2xl font-semibold text-slate-600'>No friends yet</h2>
            <p className='text-slate-500 text-center max-w-md'>Start building your network by finding and connecting with people you know.</p>
            <button 
              onClick={() => navigate('/findPeople')} 
              className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg'
            >
              Find Friends
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6'>
            {Friends?.map((people: People, index: number) => {
              const isOnline = onlineUsers?.some((user: any) => user.user_id == people?._id) || false
              return (
                <div 
                  key={index} 
                  className='group bg-white rounded-3xl p-4 shadow-lg border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden flex flex-col'
                >
                  {/* Gradient Top Border */}
                  <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  
                  {/* Profile Section - Fixed flex-grow to fill available space */}
                  <div 
                    onMouseLeave={() => handleHoverLeave()} 
                    onMouseEnter={() => { handleHover(people, isOnline) }} 
                    className='cursor-pointer flex-grow flex flex-col'
                  >
                    {/* Avatar Container - Fixed size */}
                    <div className='flex justify-center mb-4 flex-shrink-0'>
                      <div className={`relative ${isOnline ? 'ring-4 ring-green-200' : ''} rounded-full transition-all duration-300 group-hover:scale-105`}>
                        {/* Online Status Indicator */}
                        {isOnline && (
                          <div className='absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full animate-pulse'></div>
                        )}
                        <Userimage 
                          className='w-[72px] h-[72px] flex justify-center items-center rounded-full object-cover border-4 border-green-100 group-hover:border-green-300 transition-all duration-300' 
                          firstname={people?.firstname} 
                          lastname={people?.lastname} 
                          size={30} 
                          width={72} 
                          height={72} 
                          image={people?.profileImage} 
                        />
                      </div>
                    </div>
                    
                    {/* User Info - Flex grow to fill remaining space */}
                    <div className='text-center flex-grow flex flex-col justify-center mb-6'>
                      <h3 className='text-base font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[48px] flex items-center justify-center leading-tight px-2'>
                        {people.firstname} {people.lastname}
                      </h3>
                      <div className='min-h-[40px] flex items-start justify-center'>
                        <p className={`text-sm line-clamp-2 ${people?.userBio ? "text-slate-500" : "text-slate-300"} italic leading-tight`}>
                          {people.userBio || "No Bio"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Button - Fixed position at bottom */}
                  <div className='w-full flex-shrink-0'>
                    <button 
                      onClick={() => { navigate("/chats/t/" + people?._id) }} 
                      className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2'
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendLists
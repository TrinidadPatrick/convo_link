import React, { useEffect, useState } from 'react'
import http from '../../../http'
import Friends from './Friends'
import FriendRecommendationStore from '../../store/FriendRecommendationStore'
import Userimage from '../../ReusableComponents/Userimage'
import { useAuthContext } from '../../Auth/AuthProvider'
import onlineUserStore from '../../store/OnlineUsersStore'
import FriendsStore from '../../store/FriendsStore'

interface People{
  _id: string
  firstname : string,
  lastname : string,
  profileImage : string,
  userBio : string,
  profile_status : string
}


const FriendLists = () => {
  const {user} = useAuthContext();
  const {onlineUsers} = onlineUserStore();
  const {Friends, setFriends} = FriendsStore();

  const [searchValue, setSearchValue] = useState<string>('')

  const getFriends = async (searchValue : string) => {
    try {
      const result = await http.get('getFriends?searchValue=' + searchValue, {withCredentials: true})
      setFriends(result.data.friends)
    } catch (error : any) {
      console.log(error)
    }
  }

  useEffect(() => {
    getFriends('')
    return () => {
    }
  }, [])

  console.log(onlineUsers)

  return (
    <div className='flex flex-col gap-3 p-5 bg-white w-full shadow rounded h-full'>
      <div className='w-full'>
        <h1 className='text-xl font-medium text-gray-600'>My Friends</h1>
      </div>
      <div className='h-0.5 rounded-full bg-theme_normal'></div>
      {/* Search field */}
      <div className="relative w-fit bg-white">
        <input
            onKeyDown={(e)=>{if(e.key == 'Enter'){ getFriends(searchValue)}}}
            onChange={(e : any)=>setSearchValue(e.target.value)}
            placeholder="Type a name"
            className=" bg-[#f8f8f8] border-gray-300 px-2 py-2.5 rounded w-72 transition-all outline-none"
            name="search"
            type="text"
          />
          <button onClick={()=>getFriends(searchValue)}>
          <svg
          className="size-6 absolute top-2.5 right-3 text-gray-500"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            strokeLinejoin="round"
            strokeLinecap="round"
          ></path>
        </svg>
          </button>

      </div>
      <div className=' w-full h-full gap-3  overflow-y-scroll grid xxs:grid-cols-2 semiBase:grid-cols-3 semiMd:grid-cols-4  lg:grid-cols-7 justify-items-center pt-1 '>
      {
        // People recommendations
        Friends?.map((people : People, index : number) => {  
              const isOnline = onlineUsers?.some((user : any)=> user.user_id == people?._id)
          return (
              <div key={index}  className='px-2 pt-5 pb-2 border bg-white rounded-lg shadow w-full h-[220px] flex flex-col gap-3 overflow-hidden justify-between '>
                    {/* Profile image */}
                    <div className={`flex w-fit mx-auto rounded-full ${isOnline && 'border-[2px] border-green-500'} relative justify-center items-center`}>
                      {/* Online indicator */}
                      {
                        isOnline &&
                        <div className='absolute border-2 border-white top-0 right-0 h-5 w-5 bg-green-500 rounded-full'>
                        </div>
                      }
                        <Userimage firstname={people?.firstname} lastname={people?.lastname} size={30} width={75} height={75} />
                    </div>
                    {/* Name and bio */}
                    <div className='flex flex-col justify-start h-full'>
                    <h1 className='text-[1.1rem] text-center font-medium text-gray-800 line-clamp-1'>{people.firstname} {people.lastname}</h1>
                    <p className={`text-[0.85rem] line-clamp-2 leading-3 text-ellipsis overflow-hidden ${people?.userBio ? "text-gray-500" : "text-gray-300"} text-center `}>{people.userBio || "No Bio"}</p>
                    </div>

                    {/* Add button */}
                    <div className='flex w-full justify-center'>

                        <div className='flex flex-col gap-1.5 w-full'>
                        <button onClick={()=>{}} className='flex text-sm w-full bg-theme_normal items-center justify-center py-1.5 px-2 rounded gap-2 '>
                            <p className='text-white font-normal'>Message</p>
                        </button>
                        </div>        
                    </div>
                </div>
          )
      })
      }
  </div>
    </div>
  )
}

export default FriendLists
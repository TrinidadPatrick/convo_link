import React, { useEffect, useState } from 'react'
import http from '../../../http'
import Friends from './Friends'
import FriendRecommendationStore from '../../store/FriendRecommendationStore'
import Userimage from '../../ReusableComponents/Userimage'
import FriendShipStore from '../../store/FriendShipsStore'
import { useAuthContext } from '../../Auth/AuthProvider'
import onlineUserStore from '../../store/OnlineUsersStore'

interface People{
  _id: string
  firstname : string,
  lastname : string,
  profileImage : string,
  userBio : string,
  profile_status : string
}

interface Friendship{
  _id: string,
  participants : Array<string | undefined>,
  status : string,
  initiator : string
}


const FriendLists = () => {
  const {FriendRecommendation} = FriendRecommendationStore();
  const {Friendships, setFriendShips} = FriendShipStore();
  const {user} = useAuthContext();
  const {onlineUsers} = onlineUserStore();

  const [searchValue, setSearchValue] = useState<string>('')

  return (
    <div className='flex flex-col gap-3 p-5 bg-white shadow rounded h-full'>
      <div className='w-full'>
        <h1 className='text-xl font-medium text-gray-600'>Friends</h1>
      </div>
      <div className='h-0.5 rounded-full bg-theme_normal'></div>
      {/* Search field */}
      <div className="relative w-fit bg-white">
        <input
        onChange={(e : any)=>setSearchValue(e.target.value)}
            placeholder="Type a name"
            className=" bg-[#f8f8f8] border-gray-300 px-2 py-2.5 rounded w-72 transition-all outline-none"
            name="search"
            type="text"
          />
          <button>
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
      <div className='flex gap-3 w-full h-full flex-wrap pt-1 '>
        {
            FriendRecommendation?.filter((fr : People)=>Friendships?.some((friendship : Friendship)=>friendship.participants.includes(fr._id))).map((people : People, index : number) => {
              
                return (
                    <div key={index}  className='p-2 pb-2 border bg-white rounded-lg shadow w-full h-fit flex gap-3 overflow-hidden justify-between '>
                          <div className='flex gap-2'>
                          {/* Profile image */}
                          <div className='flex aspect-square justify-center  items-center'>
                              <Userimage firstname={people?.firstname} lastname={people?.lastname} size={22} width={50} height={50} />
                          </div>
                          {/* Name and bio */}
                          <div className='flex flex-col justify-center h-full items-start'>
                          <h1 className='text-[1.1rem] text-center font-medium text-gray-800 line-clamp-1'>{people.firstname} {people.lastname}</h1>
                          <p className={`text-[0.85rem] line-clamp-2 ${people?.userBio ? "text-gray-500" : "text-gray-300"} text-start `}>{people.userBio || "No Bio"}</p>
                          </div>
                          </div>

                          <div className='flex items-center gap-20'>
                          <div className='text-[0.85rem] text-center flex items-center '>
                            {
                              onlineUsers?.some((user : any) => user.user_id == people._id) ?
                              <span className='text-theme_semidark font-semibold'>Online</span>
                              :
                              <span className='text-theme_semidark font-semibold'>Offline</span>
                            }
                          </div>

                          <button className='flex w-fit rounded-full h-fit p-2 text-sm items-center justify-center py-2 gap-2 bg-theme_normal hover:bg-theme_semilight '>
                            <span className="icon-[bi--chat-dots-fill] text-xl text-white"></span>
                          </button>
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
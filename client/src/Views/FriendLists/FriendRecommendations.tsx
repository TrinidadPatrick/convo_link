import React, { useState, useEffect } from 'react'
import http from '../../../http'
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

interface RecommendationProps {
  getRecommendations: (searchValue: string) => Promise<void>;
}


const FriendRecommendations: React.FC<RecommendationProps> = ({ getRecommendations }) => {
    const {FriendRecommendation} = FriendRecommendationStore();
    const {Friendships, setFriendShips} = FriendShipStore();
    const {user} = useAuthContext();
    const {onlineUsers} = onlineUserStore();

    const [searchValue, setSearchValue] = useState<string>('')

  // Request friendship
  const handleAddFriendship = async (userId : string) => {
    const tempData = {
        participants : [user?._id, userId],
        initiator : user?._id,
        status : 'pending',
        createdAt : Date.now(),
        updatedAt : Date.now()
    }
    setFriendShips([...Friendships, tempData])
      try {
        const result = await http.post('requestFriendship', {userId}, {withCredentials: true})
        console.log(result.data)
      } catch (error : any) {
        console.log(error)
      }
  }

  // Respond to friendship request
  const handleRespondFriendship = async (userId : string, status : string) => {
    const index = Friendships.findIndex((friendship : Friendship) => friendship?.participants.includes(user?._id) && friendship.initiator == userId)
    const newData = [...Friendships]
    newData[index].status = status
    setFriendShips(newData)

      try {
        const result = await http.post('respondFriendship', {_id : newData[index]._id, status}, {withCredentials: true})
        console.log(result.data)
      } catch (error : any) {   
        console.log(error)
      }
  }

  return (
    <div className='flex flex-col gap-3 p-5 bg-white shadow rounded h-full'>
      <div className='w-full'>
        <h1 className='text-xl font-medium text-gray-600'>Explore new friends</h1>
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
          <button onClick={()=>getRecommendations(searchValue)}>
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
            FriendRecommendation?.map((people : People, index : number) => {
              const isFriend = Friendships?.some((friendship : Friendship) => friendship?.participants.includes(people?._id) && friendship.status == 'accepted')
              const isFriendshipRequestPending = Friendships?.some((friendship : Friendship) => friendship?.participants.includes(people?._id) && friendship.initiator == user?._id && friendship.status == 'pending')
              const isFriendshipAcceptPending = Friendships?.some((friendship : Friendship) => friendship?.participants.includes(user?._id)  && friendship.initiator == people?._id && friendship.status == 'pending')
              
              if(!isFriend)
              {
                return (
                    <div key={index}  className='px-2 pt-5 pb-2 border bg-white rounded-lg shadow w-[200px] h-[270px] flex flex-col gap-3 overflow-hidden justify-between '>
                          {/* Profile image */}
                          <div className='flex w-full justify-center items-center'>
                              <Userimage firstname={people?.firstname} lastname={people?.lastname} size={30} width={80} height={80} />
                          </div>
                          {/* Name and bio */}
                          <div className='flex flex-col justify-start h-full'>
                          <h1 className='text-[1.1rem] text-center font-medium text-gray-800 line-clamp-1'>{people.firstname} {people.lastname}</h1>
                          <p className={`text-[0.85rem] line-clamp-2 ${people?.userBio ? "text-gray-500" : "text-gray-300"} text-center `}>{people.userBio || "No Bio"}</p>
                          </div>

                          {/* <p className='text-[0.85rem] text-center'>
                            {
                              onlineUsers?.some((user : any) => user.user_id == people._id) ?
                              <span className='text-theme_semidark'>Online</span>
                              :
                              <span className='text-theme_semidark'>Offline</span>
                            }
                          </p> */}
  
                          {/* Add button */}
                          <div className='flex w-full justify-center'>
                              {
                              // If the people id is in the friendships array and user is initiator meaning a request is already sent
                              isFriendshipRequestPending ?
                              <button onClick={()=>handleAddFriendship(people?._id)} className='flex hover:bg-gray-100 items-center justify-center py-1 px-7 rounded-full gap-2 border-2 border-gray-500 '>
                                  <p className='text-gray-500 font-medium'>Cancel</p>
                              </button>
                              :
                              // If the user is the responder
                              isFriendshipAcceptPending ?
                              <div className='flex gap-2'>
                              <button onClick={()=>handleRespondFriendship(people?._id, "accepted")} className='flex bg-theme_normal items-center justify-center py-1 px-2 rounded-full gap-2 border-2 border-theme_semidark '>
                                  <span className="icon-[fluent-mdl2--accept-medium] text-white font-bold"></span>
                              </button>
                              <button onClick={()=>handleRespondFriendship(people?._id, "rejected")} className='flex items-center justify-center py-1 px-7 rounded-full gap-2 border-2 border-theme_semidark '>
                                  <p className='text-theme_semidark font-medium'>Reject</p>
                              </button>
                              </div>
                              :
                              <div className='flex flex-col gap-1.5 w-full'>
                              <button onClick={()=>handleAddFriendship(people?._id)} className='flex w-full text-sm items-center justify-center py-1.5  rounded gap-2 bg-theme_semilight bg-opacity-20 '>
                                  <p className='text-theme_semidark font-medium'>Request friendship</p>
                              </button>
                              <button onClick={()=>handleAddFriendship(people?._id)} className='flex w-full text-sm items-center justify-center py-1.5  rounded gap-2 bg-gray-400 bg-opacity-20 '>
                                  <p className='text-gray-600 font-medium'>Do not show</p>
                              </button>
                              </div>
                              }           
                          </div>
                      </div>
                )
              }
            })
        }
        </div>
    </div>
  )
}

export default FriendRecommendations
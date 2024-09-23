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
    user2 : string,
    user1 : string,
    status : string,
    initiator : string
}
const FriendRecommendations = () => {
    const {FriendRecommendation, setFriendRecommendation} = FriendRecommendationStore()
    const {Friendships, setFriendShips} = FriendShipStore()
    const {user} = useAuthContext()
    const {onlineUsers} = onlineUserStore()
    
  const getRecommendations = async () => {

    try {
      const result = await http.get('getPeopleRecommendations', {withCredentials: true})
      setFriendRecommendation(result.data.friends)
    } catch (error : any) {
      console.log(error)
    }
  }

  const getFriendships = async () => {
    try {
      const result = await http.get('getFriendships', {withCredentials: true})
      setFriendShips(result.data.friendships)
    } catch (error : any) {
      console.log(error)
    }
  }

  useEffect(() => {
    getRecommendations()
    getFriendships()
    return () => {
    }
  }, [])

  const handleAddFriendship = async (userId : string) => {
    const tempData = {
        user1 : userId,
        user2 : user?._id,
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

  const handleRespondFriendship = async (userId : string, status : string) => {

    const index = Friendships.findIndex((friendship : Friendship) => friendship?.user2 == userId && friendship.user1 == user?._id)
    
    const newData = [...Friendships]
    const tempData = {
        _id : newData[index]._id,
        user1 : userId,
        user2 : user?._id,
        initiator : user?._id,
        status : status,
        createdAt : newData[index].createdAt,
        updatedAt : Date.now()
    }
    newData[index] = tempData
    setFriendShips(newData)

      try {
        const result = await http.post('respondFriendship', {_id : newData[index]._id, status}, {withCredentials: true})
        console.log(result.data)
      } catch (error : any) {   
        console.log(error)
      }
  }
  
  useEffect(() => {
    console.log(onlineUsers)
  }, [onlineUsers])
  return (
    <div className='flex gap-5 p-5 flex-wrap'>
        {
            FriendRecommendation?.map((people : People, index : number) => {
                return (
                    <div key={index} className='px-2 py-5 border w-[200px] flex gap-3 overflow-hidden flex-col justify-center items-center'>
                        {/* Profile image */}
                        <div>
                            <Userimage firstname={people?.firstname} lastname={people?.lastname} size={40} width={24} height={24} />
                        </div>
                        <div className='flex flex-col'>
                        <h1 className='text-[0.9rem] text-center font-medium text-gray-800 line-clamp-1'>{people.firstname} {people.lastname}</h1>
                        <p className='text-[0.85rem] text-center'>{people.userBio}</p>
                        <p className='text-[0.85rem] text-center'>
                          {
                            onlineUsers?.some((user : any) => user.user_id == people._id) ?
                            <span className='text-theme_semidark'>Online</span>
                            :
                            <span className='text-theme_semidark'>Offline</span>
                          }
                        </p>
                        </div>

                        {/* Add button */}
                        <div className='flex w-full justify-center'>
                            {
                            // If the people id is in the friendships array and user is initiator meaning a request is already sent
                            Friendships?.some((friendship : Friendship) => friendship?.user1 == people?._id && friendship.initiator == user?._id && friendship.status == 'pending') ?
                            <button onClick={()=>handleAddFriendship(people?._id)} className='flex hover:bg-gray-100 items-center justify-center py-1 px-7 rounded-full gap-2 border-2 border-gray-500 '>
                                <p className='text-gray-500 font-medium'>Cancel</p>
                            </button>
                            :
                            Friendships?.some((friendship : Friendship) => friendship?.user1 == user?._id && friendship.initiator == people?._id) ?
                            <div className='flex gap-2'>
                            <button onClick={()=>handleRespondFriendship(people?._id, "accepted")} className='flex bg-theme_normal items-center justify-center py-1 px-2 rounded-full gap-2 border-2 border-theme_semidark '>
                                <span className="icon-[fluent-mdl2--accept-medium] text-white font-bold"></span>
                            </button>
                            <button onClick={()=>handleRespondFriendship(people?._id, "rejected")} className='flex items-center justify-center py-1 px-7 rounded-full gap-2 border-2 border-theme_semidark '>
                                <p className='text-theme_semidark font-medium'>Reject</p>
                            </button>
                            </div>
                            :
                            <button onClick={()=>handleAddFriendship(people?._id)} className='flex items-center justify-center py-1 px-7 rounded-full gap-2 border-2 border-theme_semidark '>
                                <p className='text-theme_semidark font-medium'>Add</p>
                            </button>
                                
                            }
                            
                        </div>
                    </div>
                )

            })
        }
    </div>
  )
}

export default FriendRecommendations
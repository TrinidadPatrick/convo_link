import React, { useState, useEffect } from 'react'
import FriendLists from './FriendLists'
import FriendRecommendations from './FriendRecommendations'
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



const Friends = () => {
    const {FriendRecommendation, setFriendRecommendation} = FriendRecommendationStore()
    const {Friendships, setFriendShips} = FriendShipStore()
    const {user} = useAuthContext()
    const {onlineUsers} = onlineUserStore()

    const getRecommendations = async (searchValue : string) => {
      console.log(searchValue)
      try {
        const result = await http.get('getPeopleRecommendations?searchValue=' + searchValue, {withCredentials: true})
        setFriendRecommendation(result.data.peopleRecommendation)
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
      getRecommendations('')
      getFriendships()
      return () => {
      }
    }, [])

  return (
    <div className='flex gap-3 w-full h-full bg-[#f9f9f9] p-3'>
        <div className='w-full'>
            <FriendLists />
        </div>
        <div className='w-full '>
            <FriendRecommendations getRecommendations={getRecommendations} />
        </div>
    </div>
  )
}

export default Friends
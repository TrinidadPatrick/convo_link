import React, { useState, useEffect } from 'react'
import FriendLists from './FriendLists'
import FriendRecommendations from './FriendRecommendations'
import http from '../../../http'
import FriendRecommendationStore from '../../store/FriendRecommendationStore'
import Userimage from '../../ReusableComponents/Userimage'
import { useAuthContext } from '../../Auth/AuthProvider'
import onlineUserStore from '../../store/OnlineUsersStore'

interface People {
  _id: string
  firstname: string,
  lastname: string,
  profileImage: string,
  userBio: string,
  profile_status: string
}

interface Friendship {
  _id: string,
  participants: Array<string | undefined>,
  status: string,
  initiator: string
}



const Friends = () => {
  const { FriendRecommendation, setFriendRecommendation } = FriendRecommendationStore()
  const { user } = useAuthContext()
  const { onlineUsers } = onlineUserStore()

  return (
    <main className='w-full h-full flex flex-col bg-[#f9f9f9] overflow-hidden'>
      <div className='flex gap-3 w-full h-full  p-3'>
        <div className='w-full '>
          <FriendRecommendations />
        </div>
      </div>
    </main>
  )
}

export default Friends
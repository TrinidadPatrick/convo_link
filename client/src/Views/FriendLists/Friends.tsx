import React from 'react'
import FriendLists from './FriendLists'
import FriendRecommendations from './FriendRecommendations'

const Friends = () => {
  return (
    <div className='flex gap-3 w-full'>
        <div className='w-full'>
            <FriendLists />
        </div>
        <div className='w-full '>
            <FriendRecommendations />
        </div>
    </div>
  )
}

export default Friends
import React, { useState, useEffect, useRef } from 'react'
import http from '../../../http'
import FriendRecommendationStore from '../../store/FriendRecommendationStore'
import Userimage from '../../ReusableComponents/Userimage'
import { useAuthContext } from '../../Auth/AuthProvider'
import onlineUserStore from '../../store/OnlineUsersStore'
import FriendsStore from '../../store/FriendsStore'
import FriendRequestStore from '../../store/FriendRequestStore'
import FriendLists from './FriendLists'
import ShowUserInfo from '../../ReusableComponents/ShowUserInfo'

interface People {
  _id: string
  firstname: string,
  lastname: string,
  profileImage: string,
  userBio: string,
  profile_status: string,
  hasSentRequest: Boolean
}

interface i_FriendRequests {
  _id: string,
  participants: Array<string | undefined>,
  status: string,
  initiator: any
}

const FriendRecommendations = () => {
  const { FriendRecommendation, setFriendRecommendation } = FriendRecommendationStore();
  const { FriendRequests, setFriendRequests } = FriendRequestStore();
  const [hoveredUser, setHoveredUser] = useState<any>(null)
  let hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchValue, setSearchValue] = useState<string>('')
  const [option, setOption] = useState<string>('Recommendations')

  // Request friendship
  const handleAddFriendship = async (userId: string) => {
    const user = FriendRecommendation.find((person: any) => person._id == userId)
    user.hasSentRequest = true
    setFriendRecommendation([...FriendRecommendation])
    try {
      const result = await http.post('requestFriendship', { userId }, { withCredentials: true })
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleCancelFriendship = async (_id: string) => {
    try {
      const result = await http.delete('cancelFriendship?_id='+_id, { withCredentials: true })
      if(result.status == 200) {
        getRecommendations_v2('')
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  // Respond to friendship request
  const handleRespondFriendship = async (_id: string, status: string) => {
    // Remove friend request from the list because it has been responded
    const index = FriendRequests.findIndex((fr: any) => fr._id == _id)
    const newData = [...FriendRequests]
    newData.splice(index, 1)
    setFriendRequests(newData)

    try {
      const result = await http.post('respondFriendship', { _id: _id, status }, { withCredentials: true })
      console.log(result.data)
    } catch (error: any) {
      console.log(error)
    }
  }

  const getRecommendations = async (searchValue: string) => {
    try {
      const result = await http.get('getPeopleRecommendations?searchValue=' + searchValue, { withCredentials: true })
      setFriendRecommendation(result.data.peopleRecommendation)
    } catch (error: any) {
      console.log(error)
    }
  }

  const getRecommendations_v2 = async (searchValue: string) => {
    try {
      const result = await http.get('getPeopleRecommendations_v2?searchValue=' + searchValue, { withCredentials: true })
      setFriendRecommendation(result.data.peopleRecommendation)
    } catch (error: any) {
      console.log(error)
    }
  }

  const getFriendRequests = async (searchValue: string) => {
    try {
      const result = await http.get('getFriendRequests?searchValue=' + searchValue, { withCredentials: true })
      setFriendRequests(result.data.friendRequests)
    } catch (error: any) {
      console.log(error)
    }
  }

  // Gets recommendations and friendships
  useEffect(() => {
    getRecommendations_v2('')
    getFriendRequests('')
    return () => {}
  }, [])

  const handleHover = (user: any, isOnline: boolean) => {
    // Cancel any previous timeout
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
  
    // Start a new one
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

  const handleSearch = () => {
    if (option == 'friendRequests') {
      getFriendRequests(searchValue)
    } else {
      getRecommendations_v2(searchValue)
    }
  }

  const clearSearch = () => {
    setSearchValue('')
    getRecommendations_v2('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 pt-20">
      {hoveredUser && <ShowUserInfo user={hoveredUser} handleRemoveHover={handleRemoveHover} />}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Explore New Friends
          </h1>
          <p className="text-gray-600">
            Discover and connect with people who share your interests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="Type a name or interest..."
              className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl text-gray-900 
                       placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 
                       transition-colors duration-200 bg-white"
            />
            {searchValue ? (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setOption('Recommendations')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              option === 'Recommendations' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            People recommendation
          </button>
          <button 
            onClick={() => setOption('friendRequests')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              option === 'friendRequests' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Friend requests
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {option === 'friendRequests' ? (
            // Friend Requests
            FriendRequests?.length > 0 ? (
              FriendRequests.map((people: i_FriendRequests, index: number) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-3xl p-4 shadow-lg border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden flex flex-col"
                >
                  {/* Profile Image */}
                  <div 
                    className="flex justify-center mb-4"
                    onMouseEnter={() => handleHover(people.initiator, false)}
                    onMouseLeave={handleHoverLeave}
                  >
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Userimage 
                        className="w-full h-full object-cover flex justify-center items-center" 
                        firstname={people?.initiator.firstname} 
                        lastname={people?.initiator.lastname} 
                        size={30} 
                        width={80} 
                        height={80} 
                      />
                    </div>
                  </div>

                  {/* Name and Bio */}
                  <div 
                    className="text-center mb-6"
                    onMouseEnter={() => handleHover(people.initiator, false)}
                    onMouseLeave={handleHoverLeave}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {people.initiator.firstname} {people.initiator.lastname}
                    </h3>
                    <p className={`text-sm ${
                      people?.initiator.userBio ? "text-gray-600" : "text-gray-400 italic"
                    }`}>
                      {people.initiator.userBio || "No bio"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleRespondFriendship(people?._id, "accepted")}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium 
                               hover:bg-green-600 hover:shadow-md transition-all duration-200"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRespondFriendship(people?._id, "rejected")}
                      className="w-full text-green-600 py-3 px-4 rounded-lg font-medium 
                               hover:bg-green-50 transition-all duration-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No pending friend requests</p>
              </div>
            )
          ) : (
            // People Recommendations
            FriendRecommendation?.length > 0 ? (
              FriendRecommendation.map((people: People, index: number) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-3xl p-4 shadow-lg border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden flex flex-col"
                >
                  {/* Profile Image */}
                  <div 
                    className="flex justify-center mb-4"
                    onMouseEnter={() => handleHover(people, false)}
                    onMouseLeave={handleHoverLeave}
                  >
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Userimage 
                        className="w-full h-full object-cover flex justify-center items-center" 
                        firstname={people?.firstname} 
                        lastname={people?.lastname} 
                        size={30} 
                        width={80} 
                        height={80} 
                      />
                    </div>
                  </div>

                  {/* Name and Bio */}
                  <div 
                    className="text-center mb-6"
                    onMouseEnter={() => handleHover(people, false)}
                    onMouseLeave={handleHoverLeave}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {people.firstname} {people.lastname}
                    </h3>
                    <p className={`text-sm ${
                      people?.userBio ? "text-gray-600" : "text-gray-400 italic"
                    }`}>
                      {people.userBio || "No bio"}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div>
                    {people?.hasSentRequest ? (
                      <button 
                        onClick={() => handleCancelFriendship(people?._id)}
                        className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg font-medium 
                                 hover:bg-gray-200 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddFriendship(people?._id)}
                        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium 
                                 hover:bg-green-600 hover:shadow-md transition-all duration-200"
                      >
                        Request friendship
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No recommendations available</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendRecommendations
import React, { useState, useEffect } from 'react'
import http from '../../../http'
import FriendRecommendationStore from '../../store/FriendRecommendationStore'
import Userimage from '../../ReusableComponents/Userimage'
import { useAuthContext } from '../../Auth/AuthProvider'
import onlineUserStore from '../../store/OnlineUsersStore'
import FriendsStore from '../../store/FriendsStore'
import FriendRequestStore from '../../store/FriendRequestStore'
import FriendLists from './FriendLists'

interface People{
    _id: string
    firstname : string,
    lastname : string,
    profileImage : string,
    userBio : string,
    profile_status : string,
    hasSentRequest : Boolean
}

interface i_FriendRequests{
    _id: string,
    participants : Array<string | undefined>,
    status : string,
    initiator : any
}

interface RecommendationProps {
  getRecommendations: (searchValue: string) => Promise<void>;
}


const FriendRecommendations = () => {
    const {FriendRecommendation, setFriendRecommendation} = FriendRecommendationStore();
    const {FriendRequests, setFriendRequests} = FriendRequestStore();

    const [searchValue, setSearchValue] = useState<string>('')
    const [option, setOption] = useState<string>('Recommendations')
    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)

  // Request friendship
  const handleAddFriendship = async (userId : string) => {
    const user = FriendRecommendation.find((person : any) => person._id == userId)
    user.hasSentRequest = true
    setFriendRecommendation([...FriendRecommendation])
      try {
        const result = await http.post('requestFriendship', {userId}, {withCredentials: true})
      } catch (error : any) {
        console.log(error)
      }
  }

  // Respond to friendship request
  const handleRespondFriendship = async (_id : string, status : string) => {
    // Remove friend request from the list because it has been responded
    const index = FriendRequests.findIndex((fr : any)=> fr._id == _id)
    const newData = [...FriendRequests]
    newData.splice(index, 1)
    setFriendRequests(newData)

      try {
        const result = await http.post('respondFriendship', {_id : _id, status}, {withCredentials: true})
        console.log(result.data)
      } catch (error : any) {   
        console.log(error)
      }
  }

  const getRecommendations = async (searchValue : string) => {
    try {
      const result = await http.get('getPeopleRecommendations?searchValue=' + searchValue, {withCredentials: true})
      setFriendRecommendation(result.data.peopleRecommendation)
    } catch (error : any) {
      console.log(error)
    }
  }

  const getRecommendations_v2 = async (searchValue : string) => {
    try {
      const result = await http.get('getPeopleRecommendations_v2?searchValue=' + searchValue, {withCredentials: true})
      setFriendRecommendation(result.data.peopleRecommendation)
    } catch (error : any) {
      console.log(error)
    }
  }

  const getFriendRequests = async (searchValue : string) => {
    try {
      const result = await http.get('getFriendRequests?searchValue=' + searchValue, {withCredentials: true})
      setFriendRequests(result.data.friendRequests)
    } catch (error : any) {
      console.log(error)
    }
  }

  // Gets recommendations and friendships
  useEffect(() => {
    getRecommendations_v2('')
    getFriendRequests('')
    return () => {
    }
  }, [])

  return (
    <div className='flex flex-col gap-3 p-5 bg-[#f9f9f9] shadow w-full h-[100svh]'>
      <div className='w-full  relative flex justify-between items-center'>
        <h1 className={`text-xl ${showMobileSearch ? ' opacity-0' : 'opacity-100'} transition-all font-medium text-gray-600`}>Explore new friends</h1>
        <div className='flex gap-3 Base:hidden items-center'>
          {
            showMobileSearch ?
            <button onClick={()=>setShowMobileSearch(false)} className='p-1 border-gray-500 rounded-full border w-8 flex justify-center items-center h-8 bg-gray-100'>
              <span className="icon-[iconoir--cancel] text-2xl font-bold text-gray-500"></span>
            </button>
            :
            <button onClick={()=>setShowMobileSearch(true)} className='p-1 border-gray-500 rounded-full border w-8 flex justify-center items-center h-8 bg-gray-100'> 
            <span className="icon-[icon-park-outline--search] text-gray-500 text-lg"></span>
            </button>
          }
          
          
        </div>
        {/* Search field mobile */}
        <div className={`${showMobileSearch ? 'w-[90%] sm:w-[250px] border border-gray-500' : 'w-0'} Base:hidden flex items-center overflow-hidden transition-all origin-right right-11 absolute  rounded-full bg-white h-8`}>
          <input
              onChange={(e : any)=>setSearchValue(e.target.value)}
              onKeyDown={(e)=>{if(e.key == 'Enter'){ 
                if(option == 'friendRequests') {
                  getFriendRequests(searchValue)
                }
                else {
                  getRecommendations(searchValue)
                }
              }}}
              placeholder="Type a name"
              className="px-3 text-sm text-gray-600"
              name="search"
              type="text"
          />
        </div>
      </div>
      <div className='h-0.5 rounded-full opacity-30 bg-theme_normal'></div>

      <div className='flex gap-3'>
      {/* Search field */}
      <div className="relative hidden Base:block w-full sm:w-fit border rounded bg-white">
        <input
        onChange={(e : any)=>setSearchValue(e.target.value)}
            placeholder="Type a name"
            className=" bg-[#f8f8f8] border-gray-300 px-2 py-2.5 rounded w-full sm:w-72 transition-all outline-none"
            name="search"
            type="text"
        />
        <button onClick={()=>{if(option == 'friendRequests') {
          getFriendRequests(searchValue)
        }
        else {
          getRecommendations(searchValue)
        }
        }}>
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

        <div className='flex gap-3 justify-center items-center'>
          <button onClick={()=>setOption('Recommendations')} className={`px-3 semiSm:px-5 text-sm Base:text-base py-1 border border-theme_normal rounded-full ${option == 'Recommendations' ? 'bg-theme_normal text-white' : 'text-gray-500'}`}>People recommedation</button>
          <button onClick={()=>setOption('friendRequests')} className={`px-3 semiSm:px-5 text-sm Base:text-base py-1 border border-theme_normal rounded-full ${option == 'friendRequests' ? 'bg-theme_normal text-white' : 'text-gray-500'}`}>Friend requests</button>
        </div>
      </div>
      <div className=' w-full h-full gap-3  overflow-y-scroll grid xxs:grid-cols-2 semiBase:grid-cols-3 semiMd:grid-cols-4  lg:grid-cols-6 justify-items-center pt-1 '>
        {
            option == 'friendRequests' ?
            // Pending requests
            FriendRequests?.map((people : i_FriendRequests, index : number) => {  
                return (
                    <div key={index}  className='px-2 pt-5 pb-2 border bg-white rounded-lg shadow w-full h-[260px] flex flex-col gap-3 overflow-hidden justify-between '>
                          {/* Profile image */}
                          <div className='flex w-full justify-center items-center'>
                              <Userimage firstname={people?.initiator.firstname} lastname={people?.initiator.lastname} size={30} width={80} height={80} />
                          </div>
                          {/* Name and bio */}
                          <div className='flex flex-col justify-start h-full'>
                          <h1 className='text-[1.1rem] text-center font-medium text-gray-800 line-clamp-1'>{people.initiator.firstname} {people.initiator.lastname}</h1>
                          <p className={`text-[0.85rem] line-clamp-2 leading-3 text-ellipsis overflow-hidden ${people?.initiator.userBio ? "text-gray-500" : "text-gray-300"} text-center `}>{people.initiator.userBio || "No Bio"}</p>
                          </div>
                          {/* Add button */}
                          <div className='flex w-full justify-center'>
                              <div className='flex flex-col w-full gap-2'>
                              <button onClick={()=>handleRespondFriendship(people?._id, "accepted")} className='flex bg-theme_normal items-center justify-center py-1.5 px-2 rounded gap-2 '>
                                  <p className='text-white text-sm'>Accept</p>
                              </button>
                              <button onClick={()=>handleRespondFriendship(people?._id, "rejected")} className='flex items-center justify-center py-1.5 px-7 rounded gap-2 '>
                                  <p className='text-theme_semidark font-medium text-sm'>Reject</p>
                              </button>
                              </div>
                                     
                          </div>
                      </div>
                )
            })
            :
            // People recommendations
            FriendRecommendation?.map((people : People, index : number) => {  
              
                return (
                    <div key={index}  className='px-2 pt-5 pb-2 border bg-white rounded-lg shadow w-full h-[220px] flex flex-col gap-3 overflow-hidden justify-between '>
                          {/* Profile image */}
                          <div className='flex w-full justify-center items-center'>
                              <Userimage firstname={people?.firstname} lastname={people?.lastname} size={30} width={80} height={80} />
                          </div>
                          {/* Name and bio */}
                          <div className='flex flex-col justify-start h-full'>
                          <h1 className='text-[1.1rem] text-center font-medium text-gray-800 line-clamp-1'>{people.firstname} {people.lastname}</h1>
                          <p className={`text-[0.85rem] line-clamp-2 leading-3 text-ellipsis overflow-hidden ${people?.userBio ? "text-gray-500" : "text-gray-300"} text-center `}>{people.userBio || "No Bio"}</p>
                          </div>
  
                          {/* Add button */}
                          <div className='flex w-full justify-center'>
                              {
                              // If the people id is in the friendships array and user is initiator meaning a request is already sent
                              people?.hasSentRequest ?
                              <button onClick={()=>handleAddFriendship(people?._id)} 
                              className='flex w-full text-sm items-center justify-center py-1.5  rounded gap-2 bg-theme_semilight bg-opacity-20 '
                              >
                                  <p className='font-medium text-theme_normal'>Cancel</p>
                              </button>
                              :
                              <div className='flex flex-col gap-1.5 w-full'>
                              <button onClick={()=>handleAddFriendship(people?._id)} className='flex text-sm w-full bg-theme_normal items-center justify-center py-1.5 px-2 rounded gap-2 '>
                                  <p className='text-white font-normal'>Request friendship</p>
                              </button>
                              </div>
                              }           
                          </div>
                      </div>
                )
            })
        }
        </div> 
    </div>
  )
}

export default FriendRecommendations
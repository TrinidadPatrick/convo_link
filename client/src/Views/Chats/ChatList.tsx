import React from 'react'
import Userimage from '../../ReusableComponents/Userimage'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import http from '../../../http'

interface conversationsProps{
    conversations : Array<any>
    userId : string
    socket : any
    showChatWindow : boolean,
    setShowChatWindow : (showChatWindow : boolean) => void,
    getConversations : () => void
}

interface ProfileProps{
  width : number,
  height : number,
  size : number,
  firstname? : string | null,
  lastname? : string | null,
  borderRadius? : number
}

const ChatList : React.FC<conversationsProps> = ({conversations, userId, setShowChatWindow , getConversations}) => {
  const navigate = useNavigate();
  const {_id, option} = useParams()


  const RenderProfile = ({width, height, size, firstname, lastname, borderRadius} : ProfileProps) => {
  return (
  <div style={{width: `${width}px`, height: `${height}px`, borderRadius: `${borderRadius}px`}} className={`flex rounded-full items-center justify-center aspect-square bg-gray-200 border border-gray-400`}>
    <p className='text-gray-500' style={{fontSize: `${size}px`}}>{firstname && firstname[0]}</p>
    <p className='text-gray-500' style={{fontSize: `${size}px`}}>{lastname && lastname[0]}</p>
  </div>

  )
  }

  const handleSelectConversation = async (option : string, recipientId : string, conversationID : string, isRead : boolean) => {
    
    navigate(`/chats/${option}/${recipientId}`, { replace: true });
    if(!isRead)
    {
      try {
        const result = await http.patch('readConversation', {option, _id, conversationID })
        getConversations()
      } catch (error) {
        console.log(error)
      }
    }

  };

  return (
    <main className='w-full h-full flex flex-col gap-3 bg-white rounded p-2'>
      <div className='w-full flex justify-between'>
        <h2 className='text-xl font-semibold text-theme_semidark'>Chats</h2>

        <button onClick={()=>{navigate('/friends')}} className='text-gray-600 hover:text-gray-500 text-sm flex gap-1 items-center'>
          Friends
          <span className="icon-[la--user-friends] text-lg"></span>
        </button>
      </div>
      {/* Search bar */}
      <div className='flex w-full items-center justify-between'>
        <input type='text' placeholder='Search' className='w-full h-9 rounded-full bg-gray-100 ps-5 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
      </div>

      {/* Chat list */}
      <div className='flex flex-col gap-3'>
        {
          conversations.map((conversation : any, index : number)=>{
            const isRead = conversation?.lastMessage?.messageId?.readBy.includes(userId)
            const messageId = conversation?.lastMessage?.messageId?._id
            const recipient = conversation.participants.find((participant : any)=>{
              return participant.userId._id !== userId
            })
            // is today
            const isToday = new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }) === new Date(conversation.lastMessage.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })

            const option  = conversation?.isGroup ? 'g' : 't'
            const isSelected = option == option && _id == recipient.userId._id

            const timestamp = isToday ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'}) 
            : new Date(conversation.lastMessage.timestamp).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
            
            const isSentByUser = conversation.lastMessage.messageId.senderId === userId
            return (
              <div onClick={()=>{handleSelectConversation(option, recipient.userId._id, conversation._id || '', isRead);setShowChatWindow(true)}} key={index} className={`flex ${isSelected ? 'bg-gray-100 border-l-4 border-theme_normal' : 'bg-white'} py-3 px-2 rounded gap-2 cursor-pointer items-center`}>
                <div className=''>
                   <Userimage className='flex w-[50px] aspect-square object-cover justify-center items-center rounded-full bg-gray-100' firstname={recipient.userId.firstname} lastname={recipient.userId.lastname} size={25} width={40} height={40} image={recipient.userId.profileImage} />
                </div>
                <div className='flex flex-col w-full gap-1'>
                  <p className={`text-sm ${!isRead ? 'font-extrabold' : 'font-medium'} text-gray-800`}>{recipient.userId.firstname} {recipient.userId.lastname}</p>
                  <p className='text-xs text-gray-500'>{isSentByUser ? 'You: ' : ''} {conversation.lastMessage.messageId.content}</p>
                </div>
                {/* Timestap */}
                <div className='flex flex-col justify-start h-full  '>
                  <p className='text-[0.65rem] text-gray-500 whitespace-nowrap mt-1'>{timestamp}</p>
                </div>
              </div>
            )
          })
        }
      </div>
    </main>
  )
}

export default ChatList
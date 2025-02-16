import React from 'react'
import Userimage from '../../ReusableComponents/Userimage'

interface conversationsProps{
    conversations : Array<any>
    userId : string
    socket : any
}

interface ProfileProps{
  width : number,
  height : number,
  size : number,
  firstname? : string | null,
  lastname? : string | null,
  borderRadius? : number
}

const ChatList : React.FC<conversationsProps> = ({conversations, userId, socket}) => {

  const RenderProfile = ({width, height, size, firstname, lastname, borderRadius} : ProfileProps) => {
  return (
  <div style={{width: `${width}px`, height: `${height}px`, borderRadius: `${borderRadius}px`}} className={`flex rounded-full items-center justify-center aspect-square bg-gray-200 border border-gray-400`}>
    <p className='text-gray-500' style={{fontSize: `${size}px`}}>{firstname && firstname[0]}</p>
    <p className='text-gray-500' style={{fontSize: `${size}px`}}>{lastname && lastname[0]}</p>
  </div>

  )
    
  }

  return (
    <main className='w-full h-full flex flex-col gap-3 bg-white rounded p-2'>
      <div>
        <h2 className='text-xl font-semibold text-theme_semidark'>Chats</h2>
      </div>
      {/* Search bar */}
      <div className='flex w-full items-center justify-between'>
        <input type='text' placeholder='Search' className='w-full h-9 rounded-full bg-gray-100 ps-5 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
      </div>

      {/* Chat list */}
      <div className='flex flex-col gap-3'>
        {
          conversations.map((conversation : any, index : number)=>{
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

            const timestamp = isToday ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'}) 
            : new Date(conversation.lastMessage.timestamp).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
            
            const isSentByUser = conversation.lastMessage.messageId.senderId === userId
            return (
              <div key={index} className='flex gap-2 items-center'>
                <div className='w-10 h-10 rounded-full'>
                   {
                    recipient.userId.profileImage ? <img src={recipient.userId.profileImage} alt="profile-image" className='w-full h-full object-cover' />
                    : <RenderProfile width={40} height={39} borderRadius={100} size={20} firstname={recipient.userId.firstname} lastname={recipient.userId.lastname} />
                   }
                </div>
                <div className='flex flex-col w-full gap-1'>
                  <p className='text-sm font-medium text-gray-800'>{recipient.userId.firstname} {recipient.userId.lastname}</p>
                  <p className='text-xs text-gray-500'>{isSentByUser ? 'You: ' : ''} {conversation.lastMessage.messageId.content}</p>
                </div>
                {/* Timestap */}
                <div className='flex flex-col justify-start h-full '>
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
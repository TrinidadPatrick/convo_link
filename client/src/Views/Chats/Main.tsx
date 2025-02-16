import React, { useEffect, useState } from 'react'
import ChatWindow from './ChatWindow'
import ChatList from './ChatList'
import http from '../../../http'
import SocketStore from '../../store/SocketStore'

const Main = () => {
  const {socket} = SocketStore()
  const [conversations, setConversations] = useState<Array<any>>([])
  const [userId, setUserId] = useState<string>('')

  const getConversations = async () => {
    try {
        const result = await http.get('getConversationList', {withCredentials: true})
        setConversations(result.data.conversations)
        setUserId(result.data.user._id)
    } catch (error : any) {
        console.log(error)
    }
  }


  useEffect(() => {  
   getConversations()
  }, [])

  useEffect(() => {
    socket?.on('notification_receive', (data : any) => {
        if(data == 'newMessage')
        {
            getConversations()
        }
    })
  }, [socket])
    
  return (
    <div className='w-full h-[100svh] overflow-hidden bg-[#f9f9f9] flex gap-2 p-2'>
        <section className='w-[400px] bg-white hidden sm:block'>
            <ChatList socket={socket} conversations={conversations} userId={userId} />
        </section>
        <section className='flex-1 bg-white shadow-sm'>
            <ChatWindow handleGetConversations={getConversations} />
        </section>
        
    </div>
  )
}

export default Main
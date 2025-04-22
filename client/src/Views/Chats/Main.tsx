import React, { useEffect, useState, useRef } from 'react'
import ChatWindow from './ChatWindow'
import ChatList from './ChatList'
import http from '../../../http'
import SocketStore from '../../store/SocketStore'
import { useNavigate } from 'react-router-dom'

const Main = () => {
  const childRef = useRef<any>(null);
  const navigate = useNavigate()
  const {socket} = SocketStore()
  const [conversations, setConversations] = useState<Array<any> | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [showChatWindow, setShowChatWindow] = useState<boolean>(true)
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  const getConversations = async () => {
    try {
        const result = await http.get('getConversationList', {withCredentials: true})
        setConversations(result.data.conversations)
        setUserId(result.data.user._id)
    } catch (error : any) {
        console.log(error)
    }
  }

  const handleSetShowChatWindow = (showChatWindow : boolean) => {
    setShowChatWindow(showChatWindow)
  }


  useEffect(() => {  
   getConversations()
  }, [])

  useEffect(() => {
    socket?.on('message_notification', (data : any) => {
        if(data == 'newMessage')
        {
            getConversations()
            childRef.current.handleGetConversations()
        }
    })
  }, [socket])

  return (
    <div className='w-full h-[100svh] overflow-hidden bg-[#f9f9f9] flex gap-2 p-2'>
      {
        conversations?.length == 0 ?
        <div className='w-full h-[100svh] overflow-hidden bg-[#f9f9f9] flex flex-col justify-center items-center gap-2 p-2'>
            <h2 className='text-3xl text-gray-700'>No conversations</h2>
            <p>Start a conversation with your friends</p>
            <button className='bg-theme_normal text-white text-sm rounded-full px-4 py-2 mt-4' onClick={()=>{navigate('/friends')}}>Friends</button>
        </div>
        :
        (width > 768 || (width < 768 && !showChatWindow)) && conversations?.length != 0 && (
          <section className="w-full md:w-[400px] bg-white">
            <ChatList
              setShowChatWindow={handleSetShowChatWindow}
              showChatWindow={showChatWindow}
              socket={socket}
              conversations={conversations || []}
              getConversations={getConversations}
              userId={userId}
            />
          </section>
          )}
  
          {(width > 768 || (width < 768 && showChatWindow)) && conversations?.length != 0 && (
          <section className="flex-1 bg-white shadow-sm">
            <ChatWindow
              showChatWindow={showChatWindow}
              setShowChatWindow={handleSetShowChatWindow}
              handleGetConversations={getConversations}
              ref={childRef}
            />
          </section>
        )
      }
        
        
    </div>
  )
}

export default Main
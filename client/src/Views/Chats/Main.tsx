import React, { useEffect } from 'react'
import ChatWindow from './ChatWindow'
import ChatList from './ChatList'

const Main = () => {
    
  return (
    <div className='w-full h-[100svh] overflow-hidden bg-[#f9f9f9] flex gap-2 p-2'>
        <section className='w-[400px] bg-white hidden sm:block'>
            <ChatList />
        </section>
        <section className='flex-1 bg-white shadow-sm'>
            <ChatWindow />
        </section>
        
    </div>
  )
}

export default Main
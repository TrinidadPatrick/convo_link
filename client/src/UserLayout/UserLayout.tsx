import { useEffect, useRef, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import http from "../../http"
import { useAuthContext } from "../Auth/AuthProvider"
import SocketStore from "../store/SocketStore"
import Header from "../Views/Header/Header"
import Peer, { Instance, SignalData } from "simple-peer";
import VideoCallStore from "../store/VideoCallStore"


const UserLayout = () => {
  const navigate = useNavigate()
  const {user, isAuthenticated} = useAuthContext()
  const {socket} = SocketStore()

  if(!user || !isAuthenticated)
  {
    navigate('/signin')
  }

    const handleBeforeUnload = () => {
      socket?.emit('disconnectUser', { _id: user?._id, socket_id: socket.id });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // useEffect(()=>{
    //   socket?.on('onlineUsers', (users : Array<any>) => {
    //     console.log(users)
    //   });
    // }, [socket])


  return (
    <div className="flex flex-col h-[100dvh] relative">
    <Header />
    <Outlet />
    </div>
    
  )
}

export default UserLayout
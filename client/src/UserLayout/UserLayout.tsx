import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import http from "../../http"
import { useAuthContext } from "../Auth/AuthProvider"
import SocketStore from "../store/SocketStore"
import Header from "../Views/Header/Header"


const UserLayout = () => {
  const navigate = useNavigate()
  const {user, isAuthenticated} = useAuthContext()
  const {socket} = SocketStore()

  if(!user || !isAuthenticated)
  {
    navigate('/signin')
  }

  // useEffect(() => {
    const handleBeforeUnload = () => {
      socket?.emit('disconnectUser', { _id: user?._id, socket_id: socket.id });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
  // }, []);
  return (
    <div className="flex flex-col h-[100dvh]">
    <Header />
    <Outlet />
    </div>
    
  )
}

export default UserLayout
import React, { useEffect } from 'react'
import SocketStore from '../../store/SocketStore'
import { useAuthContext } from '../../Auth/AuthProvider'


const UserProfile = () => {
    const {socket} : any = SocketStore()
    const {isAuthenticated} = useAuthContext()

    console.log(socket)

    useEffect(() => {
        // Check if socket is defined before attaching listeners
        if (socket !== null) {
          const handleTest = () => {
            console.log('test');
          };
    
          socket.on('test', handleTest);
    
          // Cleanup the event listener when the component unmounts
          return () => {
            socket.off('test', handleTest);
          };
        }
      }, [socket]); // Dependency array includes socket
    
  return (
    <div>UserProfile</div>
  )
}

export default UserProfile
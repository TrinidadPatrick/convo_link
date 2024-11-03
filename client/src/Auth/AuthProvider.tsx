import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import http from '../../http'
import {io} from 'socket.io-client'
import SocketStore from '../store/SocketStore';
import onlineUserStore from '../store/OnlineUsersStore';

interface UserType {
    _id : string,
    firstname : string,
    lastname : string,
    email : string,
    birthdate : Object,
    gender : string,
    profileImage : string,
    Address : Object,
    account_status : Object,
    profile_status : string
}

interface stateContextType {
    user : UserType | null,
    isAuthenticated : boolean | null,
    setUser: (user : UserType | null) => void,
    setIsAuthenticated: (isAuthenticated : boolean | null) => void
}

interface AuthProviderProps {
    children: ReactNode;
}

interface ProfileStatusType {
    _id : string,
    status : string
}

const stateContext = createContext<stateContextType>({
    user : null,
    isAuthenticated : null,
    setUser: () => {},
    setIsAuthenticated: () => {},   
})

let isSocketConnected : Boolean = false

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<UserType | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const {setSocket, socket} = SocketStore()
    const {onlineUsers, setOnlineUsers} = onlineUserStore()

    const setProfileStatus = (data : Object, socket : any) => {
        socket?.emit('setProfileStatus', data)
    }

    const addUserToConnectedUsers = (user_id : string, socket : any) => {
        socket?.emit('addUserToConnectedUsers', {user_id, socket_id : socket.id})
    }

    const initiateSocket = (user : UserType) => {
       if(!isSocketConnected)
       {
        const socket : any = io(
            // 'http://localhost:5000'
            // 'http://192.168.55.107:5000'
            'https://convo-link.onrender.com/'
            )
        isSocketConnected = true
        setSocket(socket)
        setProfileStatus({_id : user._id, status : 'Online'}, socket)
        setTimeout(() => {
            addUserToConnectedUsers(user._id, socket)
        }, 500);
        
       }

    }

    const getUser = async () => {
        try {
          const result = await http.get('getUserProfile', {withCredentials: true})
          if(result.status == 200)
          {
            setIsAuthenticated(true)
            setUser(result.data.user)
            setTimeout(() => {
                initiateSocket(result.data.user)
            }, 500)
          }
          
        } catch (error : any) {
            if(error.status == 401)
            {
                setIsAuthenticated(false)
            }
        }
        
      }

    useEffect(() => {
        getUser()
    }, [])

    useEffect(() => {
        socket?.on('onlineUsers', (users : Array<any>) => {
            setOnlineUsers(users)
        });
    }, [socket])

    

    return (
        <stateContext.Provider value={{user, isAuthenticated, setUser, setIsAuthenticated}}>
            {children}
        </stateContext.Provider>
    )

}

export const useAuthContext = () => useContext(stateContext)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import http from '../../http'
import {io} from 'socket.io-client'
import SocketStore from '../store/SocketStore';
import onlineUserStore from '../store/OnlineUsersStore';

interface AddressType{
    province : {name : string, code : string},
    barangay : {name : string, code : string},
    city : {name : string, code : string}
}

interface UserType {
    _id : string,
    firstname : string,
    lastname : string,
    email : string,
    birthdate : Object,
    gender : string,
    profileImage : string,
    Address : AddressType,
    account_status : Object,
    profile_status : string,
    userBio : string,
    hobbies : Array<string>
}

interface stateContextType {
    user : UserType | null,
    isAuthenticated : boolean | null,
    setUser: (user : UserType | null) => void,
    setIsAuthenticated: (isAuthenticated : boolean | null) => void,
    getUser: () => void
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
    getUser: () => {}
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
            import.meta.env.VITE_SOCKET_URL
            )
        isSocketConnected = true
        setSocket(socket)
        setProfileStatus({_id : user._id, status : 'Online'}, socket)
        setTimeout(() => {
            addUserToConnectedUsers(user._id, socket)
        }, 200);
        
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
        if(!user)
        {
            getUser()
        }
    }, [])

    useEffect(() => {
        if(socket)
        {
            socket?.on('onlineUsers', (users : Array<any>) => {
                setOnlineUsers(users)
            });
        }
        
    }, [socket])

    

    return (
        <stateContext.Provider value={{user, isAuthenticated, setUser, setIsAuthenticated, getUser}}>
            {children}
        </stateContext.Provider>
    )

}

export const useAuthContext = () => useContext(stateContext)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import http from '../../http'

interface stateContextType {
    user : string | null,
    isAuthenticated : boolean | null,
    setUser: (user : string | null) => void,
    setIsAuthenticated: (isAuthenticated : boolean | null) => void
}

interface AuthProviderProps {
    children: ReactNode;
}

const stateContext = createContext<stateContextType>({
    user : null,
    isAuthenticated : null,
    setUser: () => {},
    setIsAuthenticated: () => {},   
})

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    const getUser = async () => {
        try {
          const result = await http.get('getUserProfile', {withCredentials: true})
          if(result.status == 200)
          {
            setIsAuthenticated(true)
            setUser(result.data.user)
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

    return (
        <stateContext.Provider value={{user, isAuthenticated, setUser, setIsAuthenticated}}>
            {children}
        </stateContext.Provider>
    )

}

export const useAuthContext = () => useContext(stateContext)
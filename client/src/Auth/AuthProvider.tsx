import { createContext, useContext, useState } from 'react'

const stateContent = createContext({
    user : null,
    isAuthenticated : null,
    setUser: () => {},
    setIsAuthenticated: () => {},   
})

export const AuthProvider = ({}) => {
    const [user, setUser] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<string | null>(null)


}
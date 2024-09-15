import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import http from "../../http"
import { useAuthContext } from "../Auth/AuthProvider"


const UserLayout = () => {
  const navigate = useNavigate()
  const {user, isAuthenticated} = useAuthContext()
  console.log(user)
  if(!user || !isAuthenticated)
  {
    navigate('/signin')
  }
  
  return (
    <>
    <Outlet />
    </>
    
  )
}

export default UserLayout
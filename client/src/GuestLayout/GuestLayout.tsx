import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../Auth/AuthProvider'
import { useEffect } from 'react'

const GuestLayout = () => {
  const navigate = useNavigate()
  const {user, isAuthenticated} = useAuthContext()
  if(user && isAuthenticated)
  {
    navigate('/')
  }
  return (
   <>
   {user}
   <Outlet  />
   </>
  )
}

export default GuestLayout
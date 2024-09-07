import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import http from "../../http"


const UserLayout = () => {

  const getUser = async () => {
    try {
      const result = await http.get('getUserProfile', {withCredentials: true})
    console.log(result.data)
    } catch (error) {
      console.log(error)
    }
    
  }
  useEffect(() => {
    getUser()
  }, [])
  return (
    <>
    <Outlet />
    </>
    
  )
}

export default UserLayout
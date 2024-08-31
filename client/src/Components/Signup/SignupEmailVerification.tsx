import React, { useState } from 'react'
import guestBG from '../../utilities/images/Guest_bg.jpg'
import { useParams } from 'react-router-dom'
import emailIcon from '../../utilities/images/email-verification-icon.png'
import http from '../../../http'
import Loader from '../../ReusableComponents/Loader'

const SignupEmailVerification = () => {
    const {email} = useParams()
    const [otp, setOtp] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')

    const submitOtp = async () =>{
        setIsLoading(true)
        const data = {
            email,
            otp
        }

        try {
            const result = await http.post('/verifyOtp', data, {withCredentials: true})
            setSuccess(result.data.message)
        } catch (error : any) {
            setError(error.response.data.message)
        } finally {
            setIsLoading(false)
        }
        
    }

    const resendOtp = async () => {
        const data = {
            email
        }

        try {
            const result = await http.post('/resendOtp', data, {withCredentials: true})
            console.log(result.data)
        } catch (error : any) {
            setError(error.response.data.message)
        }
        
    }

  return (
    <div  className='relative w-full h-[100svh]  flex flex-col justify-center items-center'>

        <div className=' w-[400px] h-fit bg-white rounded-lg xs:shadow-md flex flex-col justify-start items-center p-5 gap-2'>
            <h1 className='text-2xl font-medium text-center text-theme_semidark'>Email Verification</h1>
            <p className='flex text-[0.8rem] text-gray-400 font-normal'>An OTP is sent to your email {email}</p>
            {/* Error message */}
            {
                error && 
                <div className='w-full bg-red-200 border p-2 border-red-500 rounded'>
                    <p className='text-sm text-center text-red-500'>{error}</p>
                </div>
            }
            {/* Success message */}
            {
                success && 
                <div className='w-full bg-green-200 border p-2 border-green-500 rounded'>
                    <p className='text-sm text-center text-green-500'>{success}</p>
                </div>
            }
            <img src={emailIcon} alt="email-icon" className='w-24 object-contain mt-4' />
            <h1 className='text-md font-medium text-center text-theme_semidark mt-4'>Enter verification code</h1>
            <input onChange={(e : any) =>setOtp(e.target.value)} type='text' placeholder='Verification Code' className='w-full h-9 rounded-md border-2 border-theme_semilight text-center text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
            <button onClick={submitOtp} className='flex text-white w-full items-center justify-center h-8 px-7 rounded-sm gap-2 bg-theme_semidark'>
                <Loader text='Done' isLoading={isLoading} />
            </button>
            <button onClick={resendOtp} className='flex text-theme_semidark hover:bg-gray-50 text-sm w-full items-center justify-center py-1 px-7 rounded-sm gap-2'>Resend OTP</button>
        </div>

        <img src={guestBG} alt="guest-bg" className=' hidden xs:block w-full opacity-95 brightness-75 h-full object-cover absolute -z-50' />
    </div>
  )
}

export default SignupEmailVerification
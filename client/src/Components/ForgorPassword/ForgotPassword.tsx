import { useState } from 'react'
import guestBG from '../../utilities/images/Guest_bg.jpg'
import Logo from '../../utilities/images/Logo.png'
import { useNavigate } from 'react-router-dom'
import http from '../../../http.ts'
import Loader from '../../ReusableComponents/Loader.tsx'

interface verificationStatus {
    emailVerified : boolean,
    otpVerified : boolean,
    passwordVerified : boolean
}

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [loading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const [showOtpInput, setShowOtpInput] = useState<boolean>(false)
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [otp, setOtp] = useState<string>('')
    const [fpVerificationStatus, setFpVerificationStatus] = useState<verificationStatus>({
        emailVerified : false,
        otpVerified : false,
        passwordVerified : false
    })

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const result = await http.post('/forgotPassword', {email})
            if( result.status === 200)
            {
                setSuccess(result.data.message)
                setShowOtpInput(true)
                setFpVerificationStatus({...fpVerificationStatus, emailVerified : true})
            }
        } catch (error : any) {
            if(error.status === 400)
            {
                setError(error.response.data.message)
                setShowOtpInput(false)
            }
        } finally{
            setIsLoading(false)
        }
    }
    
    const submitOtp = async () => {
        setError('')
        setSuccess('')
        setIsLoading(true)
        const data = {
            email,
            otp
        }
        try {
            const result = await http.post('/verifyFpyOTP', data, {withCredentials: true})
            if(result.status == 200)
            {
                setShowPasswordInput(true)
                setSuccess(result.data.message)
                setFpVerificationStatus({...fpVerificationStatus, otpVerified : true})
            }
        } catch (error : any) {
            if(error.status === 401)
            {
                setError(error.response.data.message)
            }
            else
            {
                setError('Something went wrong. Please try again.')
            }
        } finally{
            setIsLoading(false)
        }
    }

    const submitPassword = async () => {
        if(password == confirmPassword && password.length >= 8)
        {
            const data = {
                email,
                password,
                otp
            }
            setIsLoading(true)
            try {
                const result = await http.patch('/resetPassword', data, {withCredentials: true})
                if(result.status == 200)
                {
                    setSuccess(result.data.message)
                    setTimeout(() => {
                        navigate('/signin')
                    }, 2000)
                }
            } catch (error : any) {
                if(error.status == 401)
                {
                    setError(error.response.data.message)
                }
                else
                {
                    setError('Something went wrong. Please try again.')
                }
            } finally
            {
                setIsLoading(false)
            }
        }
        else if (password.length < 8 || confirmPassword.length < 8)
        {
            setError('Password must be at least 8 characters long')
        }
        else if(password != confirmPassword)
        {
            setError('Passwords do not match')
        }
    }

  return (
    <div className='relative w-full h-[100svh]  flex flex-col justify-center items-center'>

        {/* Main Card */}
        <div className='w-full xs:w-[350px] h-fit bg-white rounded-lg xs:shadow-md flex flex-col justify-start items-center p-5 gap-3'>
            <img src={Logo} alt="logo" className=' w-56 object-contain' />

            <div>
                <h1 className='text-2xl font-medium text-theme_semidark'>Reset Password</h1>
            </div>
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
            {/* Input Fields */}
            <div className={`flex flex-col gap-3 w-full ${error ? 'mt-0' : 'mt-2'}`}>
                {/* Email */}
                <div className='w-full flex gap-3'>
                    {/* Email */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--email] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <input disabled={showOtpInput} autoComplete='email' onChange={(e : any)=>setEmail(e.target.value)} type='text' placeholder='Email' className={`w-full ${showOtpInput && 'bg-gray-100 text-gray-500'} h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark`} />
                    </div>
                </div>
                {/* OTP input */}
                {
                    showOtpInput &&
                    <input disabled={showPasswordInput} onChange={(e : any) =>setOtp(e.target.value)} type='text' placeholder='Verification Code' className={`w-full ${showOtpInput && 'bg-gray-100 text-gray-500'} h-9 rounded-md border-2 border-theme_semilight text-center text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark`} />
                }
                {/* New password input */}
                {
                    showPasswordInput &&
                    (
                    <>
                    {/* Password */}
                    <div className='w-full flex gap-3'>
                    {/* Password */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--password] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <button onClick={()=>setShowPassword(!showPassword)} className='flex absolute right-2 top-2 items-center justify-center '>
                        {
                            showPassword ? <span className="icon-[fluent--eye-28-filled] text-xl text-theme_normal"></span> : <span className="icon-[fluent--eye-off-16-filled]  text-xl text-theme_normal"></span>
                        }
                    </button>
                    <input name='password' autoComplete="new-password" onKeyDown={(e)=>{if(e.key == 'Enter'){ handleSubmit()}}} onChange={(e : any)=>setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder='Enter new password' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                    </div>
                    {/* Confirm Password */}
                    <div className='w-full flex gap-3'>
                    {/* Password */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--password] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <button onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className='flex absolute right-2 top-2 items-center justify-center '>
                        {
                            showConfirmPassword ? <span className="icon-[fluent--eye-28-filled] text-xl text-theme_normal"></span> : <span className="icon-[fluent--eye-off-16-filled]  text-xl text-theme_normal"></span>
                        }
                    </button>
                    <input name='password' autoComplete="new-password" onKeyDown={(e)=>{if(e.key == 'Enter'){ handleSubmit()}}} onChange={(e : any)=>setConfirmPassword(e.target.value)} type={showConfirmPassword ? 'text' : 'password'} placeholder='Confirm password' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                    </div>
                    </>
                    )
                }
                {/* Submit button */}
                {
                    // For submitting email
                    !fpVerificationStatus.emailVerified ?
                    <div className='flex w-full justify-center'>
                        <button onClick={handleSubmit} className='flex w-full text-white hover:bg-theme_normal items-center justify-center h-9 py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                        <Loader text='Submit' isLoading={loading} />
                        </button>
                    </div>
                    :
                    // For submitting Otp
                    fpVerificationStatus.emailVerified && !fpVerificationStatus.otpVerified ?   
                    <div className='flex w-full justify-center'>
                        <button onClick={submitOtp} className='flex w-full text-white hover:bg-theme_normal items-center justify-center h-9 py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                        <Loader text='Submit Otp' isLoading={loading} />
                        </button>
                    </div>
                    :
                    fpVerificationStatus.otpVerified && 
                    <div className='flex w-full justify-center'>
                        <button onClick={submitPassword} className='flex w-full text-white hover:bg-theme_normal items-center justify-center h-9 py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                        <Loader text='Reset Password' isLoading={loading} />
                        </button>
                    </div>
                }
                
                
            </div>
            
        </div>

        <img src={guestBG} alt="guest-bg" className=' hidden xs:block w-full opacity-95 brightness-75 h-full object-cover absolute -z-50' />
    </div>
  )
}

export default ForgotPassword
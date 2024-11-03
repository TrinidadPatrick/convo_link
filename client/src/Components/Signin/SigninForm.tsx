
import { useState } from 'react'
import guestBG from '../../utilities/images/Guest_bg.jpg'
import Logo from '../../utilities/images/Logo.png'
import { useNavigate } from 'react-router-dom'
import http from '../../../http.ts'
import Loader from '../../ReusableComponents/Loader.tsx'

const SigninForm = () => {
    const navigate = useNavigate()
    const [loading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const handleSubmit = async () => {
        setIsLoading(true)
        const data = {
            email,
            password
           }
        // Entry validation
        Object.entries(data).map(([value]) => {
            if(value == '')
            {
              setError('Please fill all the fields')
              return
            }
            
        })
        try {
            const result : any = await http.post('login', data, {withCredentials: true})
            if(result.status == 200)
            {
                setTimeout(() => {
                    window.location.href = '/findPeople'
                }, 1000);
            }
        } catch (error : any) {
            if(error.status == 401)
            {
              setError(error.response.data.message)
            }
            else if(error.status == 403)
            {
              navigate('/verifyEmail/' + email)
            }
        } finally
        {
            setIsLoading(false)
        }
    }

  return (
    <div  className='relative w-full h-[100svh]  flex flex-col justify-center items-center'>

        {/* Main Card */}
        <div className='w-full xs:w-[350px] h-fit bg-white rounded-lg xs:shadow-md flex flex-col justify-start items-center p-5 gap-3'>
            <img src={Logo} alt="logo" className=' w-56 object-contain' />
            {/* Buttons */}
            <div className='flex w-full justify-center'>
            {/* Signin Button */}
            <button className='flex items-center justify-center py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                <span className="icon-[mdi--user] text-xl text-white"></span>
                <p className='text-white font-normal'>Sign In</p>
            </button>
            {/* Signin Button */}
            <button onClick={()=>navigate('/signup')} className='flex items-center justify-center py-1 px-7 rounded-sm gap-2'>
                <span className="icon-[mdi--user-add] text-xl text-black"></span>
                <p className='text-black font-normal'>Sign Up</p>
            </button>
            </div>

            {/* Input Fields */}
            <div className={`flex flex-col gap-3 w-full ${error ? 'mt-0' : 'mt-5'}`}>
            {
                error && 
                <div className='w-full bg-red-200 border p-2 border-red-500 rounded'>
                    <p className='text-sm text-center text-red-500'>{error}</p>
                </div>
            }
                {/* Email */}
                <div className='w-full flex gap-3'>
                    {/* Email */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--email] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <input onChange={(e : any)=>setEmail(e.target.value)} type='text' placeholder='Email' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                </div>
                {/* Password */}
                <div className='w-full flex flex-col items-end'>
                    {/* Password */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--password] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <button onClick={()=>setShowPassword(!showPassword)} className='flex absolute right-2 top-2 items-center justify-center '>
                        {
                            showPassword ? <span className="icon-[fluent--eye-28-filled] text-xl text-theme_normal"></span> : <span className="icon-[fluent--eye-off-16-filled]  text-xl text-theme_normal"></span>
                        }
                    </button>
                    <input onKeyDown={(e)=>{if(e.key == 'Enter'){ handleSubmit()}}} onChange={(e : any)=>setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder='Password' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>

                    <button className="text-xs mt-0.5 hover:text-gray-500" onClick={()=>{navigate('/forgotPassword')}}>Forgot password?</button>
                </div>
                {/* Submit button */}
                <div className='flex w-full justify-center'>
                  <button onClick={handleSubmit} className='flex w-full text-white items-center justify-center h-9 py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                    <Loader text='Sign in' isLoading={loading} />
                    </button>
                </div>
                {/* Already have an account? */}
                <div className='flex w-full justify-center'>
                  <p className='text-xs font-normal text-gray-600'>Dont have an account? <button onClick={()=>navigate('/signup')} className='text-theme_semidark cursor-pointer'>Sign up</button></p>
                </div>
            </div>
            
        </div>

        <img src={guestBG} alt="guest-bg" className=' hidden xs:block w-full opacity-95 brightness-75 h-full object-cover absolute -z-50' />
    </div>
  )
}

export default SigninForm
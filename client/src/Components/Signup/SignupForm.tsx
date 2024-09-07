
import { useState } from 'react'
import guestBG from '../../utilities/images/Guest_bg.jpg'
import Logo from '../../utilities/images/Logo.png'
import { useNavigate } from 'react-router-dom'
import http from '../../../http.ts'
import Loader from '../../ReusableComponents/Loader.tsx'

const SignupForm = () => {
  const navigate = useNavigate()
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']
  const years = Array.from(Array(100).keys()).map(i => new Date().getFullYear() - i)

  const [firstname, setFirstname] = useState<string>('')
  const [lastname, setLastname] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [birthdate, setBirthdate] = useState<Object>({
    year: '',
    month: '',
    day: ''
  })
  const [gender, setGender] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = async () => {
   const data = {
    firstname,
    lastname,
    email,
    birthdate,
    gender,
    password
   }

   try {
    setIsLoading(true)
    const result = await http.post('/createUser', data, {withCredentials: true})
    console.log(result.data)
    navigate('/verifyEmail/' + email)
   } catch (error : any) {
    console.log(error)
   } finally {
    setIsLoading(false)
   }
   
  }

  return (
    <div  className='relative w-full h-[100svh]  flex flex-col justify-center items-center'>
        {/* Main Card */}
        <div className='w-full xs:w-[400px] h-fit bg-white rounded-lg xs:shadow-md flex flex-col justify-start items-center p-5 gap-3'>
            <img src={Logo} alt="logo" className=' w-56 object-contain' />
            {/* Buttons */}
            <div className='flex w-full justify-center'>
            {/* Signin Button */}
            <button onClick={()=>navigate('/signin')} className='flex items-center justify-center py-1 px-7 rounded-sm gap-2'>
                <span className="icon-[mdi--user] text-xl"></span>
                <p className='text-black font-normal'>Sign In</p>
            </button>
            {/* Signin Button */}
            <button className='flex items-center justify-center py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                <span className="icon-[mdi--user-add] text-xl text-white"></span>
                <p className='text-white font-normal'>Sign up</p>
            </button>
            </div>

            {/* Input Fields */}
            <div className='flex flex-col gap-4 w-full mt-5'>
                {/* Firstname and lastname */}
                <div className='w-full flex gap-3'>
                    {/* Firstname */}
                    <div className='flex relative'>
                    <span className="icon-[ph--user-circle-light] text-2xl absolute top-1.5 left-1 text-theme_normal"></span>
                    <input onChange={(e : any)=>setFirstname(e.target.value)} type='text' placeholder='Firstname' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                    {/* Lastname */}
                    <div className='flex relative'>
                    <span className="icon-[ph--user-circle-light] text-2xl absolute top-1.5 left-1 text-theme_normal"></span>
                    <input onChange={(e : any)=>setLastname(e.target.value)} type='text' placeholder='Lastname' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                </div>
                {/* Email */}
                <div className='w-full flex gap-3'>
                    {/* Email */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--email] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <input onChange={(e : any)=>setEmail(e.target.value)} type='text' placeholder='Email' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                </div>
                {/* Password */}
                <div className='w-full flex gap-3'>
                    {/* Password */}
                    <div className='flex relative w-full'>
                    <span className="icon-[formkit--password] text-lg absolute top-[0.6rem] left-2 text-theme_normal"></span>
                    <input onChange={(e : any)=>setPassword(e.target.value)} type='password' placeholder='Password' className='w-full h-9 rounded-md border-2 border-theme_semilight ps-8 pe-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
                    </div>
                </div>
                {/* Birtdate */}
                <div className='flex w-full flex-col'>
                  <p className='text-xs font-medium text-gray-600'>Birthdate</p>
                <div className='w-full flex gap-3'>
                  <select onChange={(e : any)=>{setBirthdate({...birthdate, year: e.target.value})}} className='text-[0.8rem] cursor-pointer w-full p-1.5 rounded border-2 border-theme_semilight'>
                    {years.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select onChange={(e : any)=>{setBirthdate({...birthdate, month: e.target.value})}} className='text-[0.8rem] cursor-pointer w-full p-1.5 rounded border-2 border-theme_semilight'>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select onChange={(e : any)=>{setBirthdate({...birthdate, day: e.target.value})}} className='text-[0.8rem] cursor-pointer w-full p-1.5 rounded border-2 border-theme_semilight'>
                    {days.map((day, index) => (
                      <option key={index} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
                {/* Gender */}
                <div className='flex w-full flex-col'>
                  <p className='text-xs font-medium text-gray-600'>Gender</p>
                  <div className='w-full flex gap-3'>
                    <div className='cursor-pointer w-full justify-between px-3 py-2 flex rounded border-2 border-theme_semilight'>
                      <label className='text-xs' >Male</label>
                      <input onChange={(e : any)=>{setGender(e.target.value)}} type='radio' name='gender' value='Male' className='cursor-pointer rounded border-2 border-theme_semilight' />
                    </div>
                    <div className='cursor-pointer w-full justify-between px-3 py-2 flex rounded border-2 border-theme_semilight'>
                      <label className='text-xs' >Female</label>
                      <input onChange={(e : any)=>{setBirthdate(e.target.value)}} type='radio' name='gender' value='Female' className='cursor-pointer rounded border-2 border-theme_semilight' />
                    </div>
                    <div className='cursor-pointer w-full justify-between px-3 py-2 flex rounded border-2 border-theme_semilight'>
                      <label className='text-xs' >Others</label>
                      <input onChange={(e : any)=>{setBirthdate(e.target.value)}} type='radio' name='gender' value='Others' className='cursor-pointer rounded border-2 border-theme_semilight' />
                    </div>
                  </div>
                </div>
                {/* Submit button */}
                <div className='flex w-full justify-center'>
                  <button onClick={handleSubmit} className='flex w-full text-white items-center justify-center h-9 py-1 px-7 rounded-sm gap-2 bg-theme_semidark'>
                    <Loader text='Sign up' isLoading={loading} />
                    </button>
                </div>
                {/* Already have an account? */}
                <div className='flex w-full justify-center'>
                  <p className='text-xs font-normal text-gray-600'>Already have an account? <button onClick={()=>navigate('signin')} className='text-theme_semidark cursor-pointer'>Sign in</button></p>
                </div>
            </div>
            
        </div>
        
        <img src={guestBG} alt="guest-bg" className=' hidden xs:block w-full opacity-95 brightness-75 h-full object-cover absolute -z-50' />
    </div>
  )
}

export default SignupForm
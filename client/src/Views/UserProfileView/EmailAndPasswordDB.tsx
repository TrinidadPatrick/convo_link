import React, { useState } from 'react'
import Modal from 'react-modal';
import http from '../../../http';

const EmailAndPasswordDB : React.FC<{input : string, isOpen : boolean, setIsOpen : (isOpen : boolean) => void}> = ({input, isOpen, setIsOpen}) => {
  const [showOtp, setShowOtp] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [otp, setOtp] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)', // Change this to any color
    }
  };
  const [changePassData, setChangePassData] = useState<any>({
    currentPassword : '',
    newPassword : '',
    confirmNewPassword : ''
  })
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
  const handleSubmit = async () => {
    setLoading(true)
    try {
      if(input == 'email')
      {
        const result = await http.patch('changeEmail', {email, password})
        setError('')
        setMessage(result.data.message)
        setShowOtp(true)
      }
      else if(input == 'password')
      {
        const result = await http.patch('changePassword', changePassData)
        setError('')
        setMessage(result.data.message)
        setChangePassData({
          currentPassword : '',
          newPassword : '',
          confirmNewPassword : ''
        })
        setTimeout(() => {
          setIsOpen(false)
        }, 1000)
      }
    } catch (error : any) {
      if(error.status == 401)
      {
        setError(error.response.data.message)
      }
      
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOTP = async () => {
    setLoading(true)
    setMessage('')
    try {
      if(input == 'email' && otp)
      {
        const result = await http.patch('verifyChangeEmailOTP', {otp, email})
        setShowOtp(false)
        setError('')
        setMessage('Email successfully changed')
        setEmail('')
        setPassword('')
        setTimeout(() => {
          setIsOpen(false)
          setMessage('Email successfully changed')
        }, 1000)
      }
    } catch (error : any) {
      if(error.status == 400)
      {
        setError(error.response.data.message)
      }
    } finally{
        setLoading(false)
    }
  }
  return (
    <div>
      {
        input == 'email' ?
        <Modal onRequestClose={()=>{setIsOpen(false)}} isOpen={isOpen} style={modalStyle}>
        <div className='h-fit w-fit flex flex-col gap-1 overflow-hidden '>
          <div className='w-full flex gap-2'>
            <div className='h-[50px] bg-gray-700 rounded-sm w-[5px]'></div>
            <div>
              <h3 className=' text-xl font-medium'>Change Email</h3>
              <p className='text-sm text-gray-500'>Make sure to enter valid email</p>
            </div>
          </div>
          {/* Email Field */}
          <div className='flex flex-col'>
            {
              error != '' &&
              <div className='w-full p-2 flex justify-center bg-red-100 rounded mt-1'>
              <span className='text-xs text-red-500'>{error}</span>
              </div>
            }
            {
              message != '' &&
              <div className='w-full p-2 flex justify-center bg-green-100 rounded mt-1'>
              <span className='text-xs text-green-500'>{message}</span>
              </div>
            }
          <div className='flex flex-col justify-center items-center gap-2 w-full mt-3'>
            <div>
              <span className='text-xs text-gray-500'>Email</span>
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input disabled={showOtp} value={email} onChange={(e)=>{setEmail(e.target.value)}} autoComplete='off' type='email' className='text-gray-700 py-1 px-2 text-sm w-full text-ellipsis' />
                <button  onClick={()=>{setIsOpen(false)}} className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[ic--baseline-email] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* Password Field */}
            <div>
              <span className='text-xs text-gray-500'>Current Password</span> 
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input disabled={showOtp} autoComplete='off' required type='password' value={password} onChange={(e)=>{setPassword(e.target.value)}} className='text-gray-700 py-1 px-2 text-sm text-ellipsis w-full'></input>
                <button className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[material-symbols--edit-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* OTP Field */}
            {
              showOtp &&
              <div>
              <span className='text-xs text-gray-500'>OTP</span> 
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input autoComplete='off' required type='password' value={otp} onChange={(e)=>{setOtp(e.target.value)}} className='text-gray-700 py-1 px-2 text-sm text-ellipsis w-full'></input>
                <button className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[material-symbols--edit-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            }
            {/* Submit button */}
            <div className='flex justify-center items-center w-full mt-0'>
              {
                showOtp ?
                <button onClick={()=>handleSubmitOTP()} className='flex w-full items-center justify-center bg-slate-100 hover:bg-slate-200 rounded border px-2 py-1 text-gray-700 text-sm mt-4 '>
                  {
                    loading ?
                    <span className='text-gray-500 text-sm'>Loading...</span>
                    :
                    <span className='text-gray-500 text-sm'>Verify OTP</span>
                  }
                </button>
                :
                <button onClick={()=>handleSubmit()} className='flex w-full items-center justify-center bg-slate-100 hover:bg-slate-200 rounded border px-2 py-1 text-gray-700 text-sm mt-4 '>
                  {
                    loading ?
                    <span className='text-gray-500 text-sm'>Loading...</span>
                    :
                    <span className='text-gray-500 text-sm'>Submit</span>
                  }
                </button>
              }
            </div>
          </div>
          </div>
          <div className='flex gap-3'>
            
          </div>
        </div>
        </Modal>
        :
        <Modal onRequestClose={()=>{setIsOpen(false)}} isOpen={isOpen} style={modalStyle}>
        <div className='h-fit w-fit flex flex-col gap-1 overflow-hidden '>
          <div className='w-full flex gap-2'>
            <div className='h-[50px] bg-gray-700 rounded-sm w-[5px]'></div>
            <div>
              <h3 className=' text-xl font-medium'>Change Password</h3>
              <p className='text-sm text-gray-500'>Make sure to enter valid password</p>
            </div>
          </div>
          {/* Password Field */}
          <div className='flex flex-col'>
            {
              error != '' &&
              <div className='w-full p-2 flex justify-center bg-red-100 rounded mt-1'>
              <span className='text-xs text-red-500'>{error}</span>
              </div>
            }
            {
              message != '' &&
              <div className='w-full p-2 flex justify-center bg-green-100 rounded mt-1'>
              <span className='text-xs text-green-500'>{message}</span>
              </div>
            }
          <div className='flex flex-col justify-center items-center gap-2 w-full mt-3'>
            <div>
              <span className='text-xs text-gray-500'>Current Password</span>
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input value={changePassData.currentPassword} onChange={(e)=>{setChangePassData((prevChangePassData : any) => ({...prevChangePassData, currentPassword : e.target.value}))}} autoComplete='off' type={showCurrentPassword ? 'text' : 'password'} className='text-gray-700 py-1 px-2 text-sm w-full text-ellipsis' />
                {/* Show Password */}
                <button onClick={()=>{setShowCurrentPassword(!showCurrentPassword)}} className=' m-0 h-full px-1 bg-transparent flex justify-center items-center'>
                {
                  showCurrentPassword ?
                  <span className="icon-[ic--baseline-visibility-off] text-gray-500"></span>
                  :
                  <span className="icon-[ic--baseline-visibility] text-gray-500"></span>
                }
                </button>
                <button  onClick={()=>{setIsOpen(false)}} className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[mdi--password-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* New Password Field */}
            <div>
              <span className='text-xs text-gray-500'>New Password</span> 
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input autoComplete='off' required type={showNewPassword ? 'text' : 'password'} value={changePassData.newPassword} onChange={(e)=>{setChangePassData((prevChangePassData : any) => ({...prevChangePassData, newPassword : e.target.value}))}} className='text-gray-700 py-1 px-2 text-sm text-ellipsis w-full'></input>
                {/* Show Password */}
                <button onClick={()=>{setShowNewPassword(!showNewPassword)}} className=' m-0 h-full px-1 bg-transparent flex justify-center items-center'>
                {
                  showNewPassword ?
                  <span className="icon-[ic--baseline-visibility-off] text-gray-500"></span>
                  :
                  <span className="icon-[ic--baseline-visibility] text-gray-500"></span>
                }
                </button>
                <button className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[mdi--password-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* Confirm Password Field */}
            <div>
              <span className='text-xs text-gray-500'>Confirm New Password</span> 
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input autoComplete='off' required type={showConfirmNewPassword ? 'text' : 'password'} value={changePassData.confirmNewPassword} onChange={(e)=>{setChangePassData((prevChangePassData : any) => ({...prevChangePassData, confirmNewPassword : e.target.value}))}} className='text-gray-700 py-1 px-2 text-sm text-ellipsis w-full'></input>
                {/* Show Password */}
                <button onClick={()=>{setShowConfirmNewPassword(!showConfirmNewPassword)}} className=' m-0 h-full px-1 bg-transparent flex justify-center items-center'>
                {
                  showConfirmNewPassword ?
                  <span className="icon-[ic--baseline-visibility-off] text-gray-500"></span>
                  :
                  <span className="icon-[ic--baseline-visibility] text-gray-500"></span>
                }
                </button>
                <button className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[mdi--password-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* OTP Field */}
            {
              showOtp &&
              <div>
              <span className='text-xs text-gray-500'>OTP</span> 
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input autoComplete='off' required type='password' value={otp} onChange={(e)=>{setOtp(e.target.value)}} className='text-gray-700 py-1 px-2 text-sm text-ellipsis w-full'></input>
                <button className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[material-symbols--edit-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            }
            {/* Submit button */}
            <div className='flex justify-center items-center w-full mt-0'>
              {
                showOtp ?
                <button onClick={()=>handleSubmitOTP()} className='flex w-full items-center justify-center bg-slate-100 hover:bg-slate-200 rounded border px-2 py-1 text-gray-700 text-sm mt-4 '>
                  {
                    loading ?
                    <span className='text-gray-500 text-sm'>Loading...</span>
                    :
                    <span className='text-gray-500 text-sm'>Verify OTP</span>
                  }
                </button>
                :
                <button onClick={()=>handleSubmit()} className='flex w-full items-center justify-center bg-slate-100 hover:bg-slate-200 rounded border px-2 py-1 text-gray-700 text-sm mt-4 '>
                  {
                    loading ?
                    <span className='text-gray-500 text-sm'>Loading...</span>
                    :
                    <span className='text-gray-500 text-sm'>Submit</span>
                  }
                </button>
              }
            </div>
          </div>
          </div>
          <div className='flex gap-3'>
            
          </div>
        </div>
        </Modal>
      }
    </div>
  )
}

export default EmailAndPasswordDB
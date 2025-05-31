import React, { SetStateAction, useEffect, useRef, useState } from 'react'
import SocketStore from '../../store/SocketStore'
import { useAuthContext } from '../../Auth/AuthProvider'
import bg from '../../utilities/images/Guest_bg.jpg'
import Userimage from '../../ReusableComponents/Userimage'
import Modal from 'react-modal';
import axios from 'axios'
import 'react-dropdown/style.css';
import Select from 'react-select'
import http from '../../../http'
import EmailAndPasswordDB from './EmailAndPasswordDB'

interface AddressType {
  province: Array<any>,
  barangay: Array<any>,
  city: Array<any>,
}

interface ErrorType {
  province: Boolean,
  barangay: Boolean,
  city: Boolean
}

interface AddressValueType {
  province : {name : string, code : string},
  barangay : {name : string, code : string},
  city : {name : string, code : string}
}

const UserProfile = () => {
  const bioRef = useRef<HTMLInputElement>(null)
  const [showBioSave, setShowBioSave] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>('')
  const {user, getUser } = useAuthContext()
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpenV2, setModalIsOpenV2] = useState(false);
  const [modalIsOpenV3, setModalIsOpenV3] = useState(false);
  const [addressOptions, setAddressOptions] = useState<AddressType>({
    province: [],
    barangay: [],
    city: []
  });
  const [address, setAddress] = useState<AddressValueType>({
    province: {name : '', code : ''},
    barangay: {name : '', code : ''},
    city: {name : '', code : ''}
  })
  const [hobbies, setHobbies] = useState<Array<string>>([])
  const [hobby, setHobby] = useState<string>('')
  const [error, setError] = useState<ErrorType>({
    province: false,
    barangay: false,
    city: false
  })
  const [input, setInput] = useState<string>('')

  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '24px',
      padding: '0',
      border: 'none',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    },
    overlay: {
      backgroundColor: 'rgba(44, 95, 93, 0.8)',
      backdropFilter: 'blur(5px)',
    }
  };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#4a7c7a' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(74, 124, 122, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#4a7c7a',
      },
      borderRadius: '12px',
      padding: '4px',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2c5f5d' : state.isFocused ? '#f0fdfb' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2c5f5d' : '#f0fdfb',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    }),
  };

  const getAddressOptions = async (code: string, url: string, key: string) => {
    try {
      const result = await axios.get(url);
      setAddressOptions((prevAddress) => ({ ...prevAddress, [key]: result.data.sort((a: any, b: any) => a.name > b.name ? 1 : -1) }))
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if(!user?.Address) {
      getAddressOptions('', 'https://psgc.gitlab.io/api/provinces/', 'province')
    } else if(user.Address) {
      getAddressOptions('', 'https://psgc.gitlab.io/api/provinces/', 'province')
      getAddressOptions(
        '',
        `https://psgc.gitlab.io/api/provinces/${user.Address.province.code}/cities-municipalities/`,
        'city'
      )
      getAddressOptions(
        '',
        `https://psgc.gitlab.io/api/cities-municipalities/${user.Address.city.code}/barangays/`,
        'barangay'
      )
      setAddress(user.Address)
    }
  }, [user, modalIsOpen])

  const handleSubmit = async () => {
    setLoading(true)
    let hasError = false;
    Object.entries(address).forEach(([key, value]) => {
      if (value.name == '') {
        setError((prevError: any) => ({ ...prevError, [key]: true }))
        hasError = true;
      } else {
        setError((prevError: any) => ({ ...prevError, [key]: false }))
      }
    })

    if (!hasError) {
      try {
        const result = await http.patch('updateAddress', address, {
          withCredentials: true
        })
        setIsOpen(false)
        getUser()
      } catch (error) {
        console.log(error)
      }
    }
    setLoading(false)
  }

  const ChangeEmailPassword = (input : string) => {
    setModalIsOpenV2(true)
    setInput(input)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const updateProfileImage = async (image : string) => {
    try {
      const result = await http.patch('changeProfileImage', {image})
      if(result.status == 200) {
        getUser()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleUpload = async (e: any) => {
    const file  = e.target.files[0]
    if(!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'convo_wave_profile')
    formData.append('cloud_name', 'dnbgrdgpn')

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/dnbgrdgpn/image/upload', formData)
      const image = res.data.secure_url
      updateProfileImage(image)
    } catch (error) {
      console.log(error)
    }
  }

  const handleBioClick = () => {
    if(bioRef.current) {
      setShowBioSave(true)
      bioRef.current.className = 'w-full text-center px-4 py-2 border-2 border-teal-200 rounded-xl bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-300'
    }
  }

  const handleBioSubmit = async () => {
    if(bioRef.current) {
      try {
        const result = await http.patch('updateBio', {bio : bioRef.current.value})
        setShowBioSave(false)
        bioRef.current.className = 'text-center text-white cursor-pointer hover:text-teal-600 transition-colors duration-300 bg-transparent border-none'
        getUser()
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleRemoveHobby = (index : number) => {
    const newHobbies = [...hobbies]
    newHobbies.splice(index, 1)
    setHobbies(newHobbies)
  }

  const handleAddHobby = () => {
    if(hobby.trim()) {
      setHobbies([...hobbies, hobby.trim()])
      setHobby('')
    }
  }

  const saveHobbies = async () => {
    try {
      const result = await http.patch('updateHobbies', {hobbies})
      setModalIsOpenV3(false)
      getUser()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='p-4  mt-16 lg:p-8'>
      {/* Status Indicator */}
      <div className='fixed top-6 right-6 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse z-50'></div>
      
      {/* Main Profile Container */}
      <div className='max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden'>
        
        {/* Hero Section */}
        <div className='relative bg-gradient-to-r from-teal-400 to-cyan-500 px-8 py-16 text-center overflow-hidden'>
          {/* Decorative Elements */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent'></div>
          <div className='absolute top-0 left-0 w-full h-full opacity-10'>
            <div className='absolute top-10 left-10 w-20 h-20 border border-white/30 rounded-full'></div>
            <div className='absolute bottom-10 right-10 w-16 h-16 border border-white/30 rounded-full'></div>
            <div className='absolute top-1/2 left-1/3 w-12 h-12 border border-white/20 rounded-full'></div>
          </div>
          
          {/* Profile Image */}
          <div className='relative inline-block mb-3 group'>
            <div className=' rounded-full border-4 border-white/90 shadow-2xl overflow-hidden bg-gradient-to-br from-pink-400 to-purple-600 hover:scale-105 transition-transform duration-300'>
              <Userimage 
                className='w-24 aspect-square object-cover' 
                firstname={user?.firstname} 
                lastname={user?.lastname} 
                size={35} 
                width={100} 
                height={100} 
                image={user?.profileImage} 
              />
            </div>
            <button 
              onClick={handleClick} 
              className='absolute bottom-2 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-teal-600 hover:bg-teal-50 hover:scale-110 transition-all duration-300 group-hover:shadow-xl'
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <input accept="image/*" onChange={handleUpload} ref={fileInputRef} className='hidden' type="file" />
          </div>
          
          {/* Name and Bio */}
          <h1 className='text-2xl font-bold text-white mb-2 relative z-10'>
            {user?.firstname} {user?.lastname}
          </h1>
          <div className='mb-3 relative z-10'>
            <input 
              ref={bioRef} 
              type='text' 
              value={user?.userBio || 'Add your bio here...'} 
              onClick={() => {
                handleBioClick();
                if(bioRef.current?.value === 'Add your bio here...') {
                  bioRef.current.value = ''
                }
              }} 
              className='text-center text-white cursor-pointer hover:text-white  duration-300 bg-transparent border-none' 
            />
            {showBioSave && (
              <button 
                onClick={handleBioSubmit} 
                className='ml-3 px-4 py-1 mt-2 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-all duration-300'
              >
                Save
              </button>
            )}
          </div>
          
          {/* Location */}
          <div className='flex items-center justify-center text-white/80 text-lg relative z-10'>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {user?.Address ? (
              <span 
                onClick={() => setIsOpen(true)} 
                className='cursor-pointer text-white hover:text-gray-200 transition-colors duration-300'
              >
                {user.Address.barangay.name} {user.Address.city.name}, {user.Address.province.name}
              </span>
            ) : (
              <span 
                onClick={() => setIsOpen(true)} 
                className='cursor-pointer hover:text-white transition-colors duration-300 underline'
              >
                Add your location
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className='p-4 space-y-8'>
          
          {/* Hobbies Section */}
          <div className='bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl p-6 border border-teal-100'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-semibold text-teal-800 flex items-center'>
                <div className='w-1 h-8 bg-gradient-to-b from-teal-600 to-teal-400 rounded-full mr-3'></div>
                Hobbies & Interests
              </h2>
              <button 
                onClick={() => {setModalIsOpenV3(true); setHobbies(user?.hobbies || [])}}
                className='px-4 py-2 border-2 border-teal-500 text-teal-600 rounded-full hover:bg-teal-500 hover:text-white transition-all duration-300 font-medium'
              >
                {(user?.hobbies ?? []).length > 0 ? 'Edit' : 'Add Hobbies'}
              </button>
            </div>
            
            <div className="flex flex-wrap ">
              {user?.hobbies?.map((hobby, index) => (
                <div key={index} className='m-3'>
                  {index <= 3 && (
                    <span className="bg-white/80 text-teal-700 px-4 py-2 rounded-full border border-teal-200 shadow-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-300">
                      {hobby}
                    </span>
                  )}
                  {index === 4 && (
                    <span className="bg-white/80 text-teal-700 px-4 py-2 rounded-full border border-teal-200 shadow-sm font-medium">
                      +{user.hobbies.length - 4} more...
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div className='bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center'>
              <div className='w-1 h-8 bg-gradient-to-b from-gray-600 to-gray-400 rounded-full mr-3'></div>
              Account Information
            </h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              {/* Email Field */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-600'>Email Address</label>
                <div className='flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                  <input 
                    type='text' 
                    value={user?.email || ''} 
                    disabled 
                    className='flex-1 px-4 py-3 text-gray-700 bg-transparent'
                  />
                  <button 
                    onClick={() => ChangeEmailPassword('email')}
                    className='px-4 py-3 text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300'
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Password Field */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-600'>Password</label>
                <div className='flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                  <input 
                    type='password' 
                    value='••••••••••••' 
                    disabled 
                    className='flex-1 px-4 py-3 text-gray-700 bg-transparent'
                  />
                  <button 
                    onClick={() => ChangeEmailPassword('password')}
                    className='px-4 py-3 text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300'
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email/Password Modal */}
      <EmailAndPasswordDB input={input} isOpen={modalIsOpenV2} setIsOpen={setModalIsOpenV2} />
      
      {/* Address Modal */}
      <Modal isOpen={modalIsOpen} style={modalStyle}>
        <div className='w-full max-w-2xl p-8 overflow-hidden'>
          <div className='flex items-start gap-4 mb-6'>
            <div className='w-1 h-16 bg-gradient-to-b from-teal-600 to-teal-400 rounded-full'></div>
            <div>
              <h3 className='text-2xl font-bold text-gray-800 mb-2'>Update Address</h3>
              <p className='text-gray-600'>This information will be displayed on your profile</p>
            </div>
          </div>
          
          <div className='grid md:grid-cols-2 gap-6 mb-8'>
            {/* Province Dropdown */}
            <div className="space-y-2">
              <label className='text-sm font-medium text-gray-700'>Province</label>
              <Select
                styles={customSelectStyles}
                placeholder="Select Province"
                options={addressOptions.province.map((prov) => ({
                  value: prov.code,
                  label: prov.name,
                }))}
                value={address.province.name ? {value: address.province.code, label: address.province.name} : null}
                onChange={(e: any) => {
                  getAddressOptions(e.value, `https://psgc.gitlab.io/api/provinces/${e.value}/cities-municipalities/`, 'city');
                  setAddress({
                    ...address,
                    barangay: {name: '', code: ''},
                    city: {name: '', code: ''},
                    province: {name: e.label, code: e.value}
                  });
                  setAddressOptions((prevAddress) => ({...prevAddress, barangay: []}));
                }}
              />
              {error.province && <p className='text-red-500 text-sm'>Please select a province</p>}
            </div>

            {/* City Dropdown */}
            <div className="space-y-2">
              <label className='text-sm font-medium text-gray-700'>City</label>
              <Select
                styles={customSelectStyles}
                placeholder="Select City"
                options={addressOptions.city.map((city) => ({
                  value: city.code,
                  label: city.name,
                }))}
                value={address.city.name ? {value: address.city.code, label: address.city.name} : null}
                onChange={(e: any) => {
                  getAddressOptions(e.value, `https://psgc.gitlab.io/api/cities-municipalities/${e.value}/barangays/`, 'barangay');
                  setAddress({
                    ...address,
                    barangay: {name: '', code: ''},
                    city: {name: e.label, code: e.value}
                  });
                }}
              />
              {error.city && <p className='text-red-500 text-sm'>Please select a city</p>}
            </div>

            {/* Barangay Dropdown */}
            <div className="space-y-2 md:col-span-2">
              <label className='text-sm font-medium text-gray-700'>Barangay</label>
              <Select
                menuPlacement='top'
                styles={customSelectStyles}
                placeholder="Select Barangay"
                options={addressOptions.barangay.map((barangay) => ({
                  value: barangay.code,
                  label: barangay.name,
                }))}
                value={address.barangay.name ? {value: address.barangay.code, label: address.barangay.name} : null}
                onChange={(e: any) => {
                  setAddress({
                    ...address,
                    barangay: {name: e.label, code: e.value}
                  });
                }}
              />
              {error.barangay && <p className='text-red-500 text-sm'>Please select a barangay</p>}
            </div>
          </div>
          
          <div className='flex gap-3 justify-end'>
            <button 
              onClick={() => setIsOpen(false)} 
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300'
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className='px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all duration-300 disabled:opacity-50'
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Hobbies Modal */}
      <Modal isOpen={modalIsOpenV3} style={modalStyle}>
        <div className='w-full max-w-lg p-4'>
          <div className='flex items-start gap-4 mb-6'>
            <div className='w-1 h-16 bg-gradient-to-b from-teal-600 to-teal-400 rounded-full'></div>
            <div>
              <h3 className='text-2xl font-bold text-gray-800 mb-2'>Edit Hobbies</h3>
              <p className='text-gray-600'>Add or remove your hobbies and interests</p>
            </div>
          </div>
          
          <div className='space-y-6'>
            <div className='flex flex-wrap gap-3'>
              {hobbies.map((hobby, index) => (
                <div key={index} className='relative group'>
                  <button 
                    onClick={() => handleRemoveHobby(index)} 
                    className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors duration-300 opacity-0 group-hover:opacity-100'
                  >
                    ×
                  </button>
                  <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium border border-teal-200">
                    {hobby}
                  </span>
                </div>
              ))}
            </div>
            
            <div className='flex gap-3'>
              <input 
                onKeyDown={(e) => {if(e.key === 'Enter') handleAddHobby()}} 
                value={hobby} 
                onChange={(e) => setHobby(e.target.value)} 
                type='text' 
                placeholder='Add a new hobby...' 
                className='flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300' 
              />
              <button 
                onClick={handleAddHobby}
                disabled={!hobby.trim()}
                className='px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Add
              </button>
            </div>
            
            <div className='flex gap-3 justify-end pt-4'>
              <button 
                onClick={() => setModalIsOpenV3(false)} 
                className='px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300'
              >
                Cancel
              </button>
              <button 
                onClick={saveHobbies} 
                disabled={loading}
                className='px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all duration-300 disabled:opacity-50'
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

Modal.setAppElement('#root')
export default UserProfile
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
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)', // Change this to any color
    }
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
    // Meaning only runs if there is no user or address options is empty
    if(!user?.Address)
    {
      getAddressOptions('', 'https://psgc.gitlab.io/api/provinces/', 'province')
    }
    // Meaning only runs if there is a user and address options is not empty
    else if(user.Address)
    {
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
      }
      else {
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
      if(result.status == 200)
      {
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
    if(bioRef.current)
    {
      setShowBioSave(true)
      bioRef.current.className = 'text-center text-gray-500 px-2 py-1 border rounded-sm w-fit mx-auto bg-gray-100'
    }
  }

  const handleBioSubmit = async () => {
    if(bioRef.current)
    {
      try {
        const result = await http.patch('updateBio', {bio : bioRef.current.value})
        setShowBioSave(false)
        bioRef.current.className = 'text-center underline text-gray-500 w-fit mx-auto cursor-pointer hover:text-gray-400'
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
    setHobbies([...hobbies, hobby])
    setHobby('')
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


  // useEffect(() => {
  //     // Check if socket is defined before attaching listeners
  //     if (socket !== null) {
  //       const handleTest = () => {
  //         console.log('test');
  //       };

  //       socket.on('test', handleTest);

  //       // Cleanup the event listener when the component unmounts
  //       return () => {
  //         socket.off('test', handleTest);
  //       };
  //     }
  //   }, [socket]); // Dependency array includes socket
  // Modal.setAppElement('#root');

  return (
    <div className='w-full h-full flex flex-col'>
      {/* Background 1 */}
      <div style={{ backgroundImage: `url(${bg})` }} className='w-full h-[250px] min-h-[250px] bg-[20%_55%] brightness-50 bg-cover bg-no-repeat'>

      </div>
      {/* Background 2 */}
      <div className='w-full relative flex-1 flex flex-col gap-3 p-2'>
        <section className='w-full flex flex-col xs:w-[80%] md:w-[50%] h-[100%] -top-16 left-1/2 transform -translate-x-1/2 absolute bg-white rounded shadow-md'>
          {/* Image Section */}
          <div className='w-full h-[100px]  flex justify-center relative'>
            <div className='absolute -top-14'>
              <Userimage className='flex w-[130px] object-cover rounded-full items-center justify-center aspect-square bg-gray-200 shadow-lg' firstname={user?.firstname} lastname={user?.lastname} size={35} width={130} height={130} image={user?.profileImage} />
              <button onClick={handleClick} className='absolute bottom-2 right-0 rounded-full  w-[30px] h-[30px] flex justify-center items-center bg-white border text-gray-700 text-sm'>
              <span className="icon-[line-md--edit]"></span>
              </button>
              <input accept="image/*" onChange={handleUpload} ref={fileInputRef} className='hidden' type="file" name="" id="" />
            </div>
          </div>
          {/* Name and bio */}
          <div className='flex flex-col gap-1 w-full'>
            <span className='text-[1.7rem] text-center font-medium text-gray-600'>{user?.firstname} {user?.lastname}</span>
            <div className='mx-auto flex gap-2'>
              <input ref={bioRef} type='text' defaultValue={user?.userBio} onClick={()=>{handleBioClick()}} className='text-center text-gray-500 underline cursor-pointer hover:text-gray-400' />
              {
                showBioSave &&
                <button onClick={handleBioSubmit} className='text-sm text-gray-600 hover:text-gray-500'>Save</button>
              }
            </div>
          </div>

          {/* Address */}
          <div className='flex justify-center items-center gap-2 w-full mt-7'>
            <span className="icon-[tdesign--location] text-gray-700 text-xl"></span>
            {
              user?.Address ?
                <p onClick={() => setIsOpen(true)} className='text-gray-700 cursor-pointer'>{user?.Address.barangay.name} {user?.Address.city.name}, {user.Address.province.name}</p>
                :
                <p onClick={() => setIsOpen(true)} className='text-gray-400 underline cursor-pointer hover:text-gray-300'>Setup Address</p>
            }

          </div>
          {/* Edit Hobbies */}
          <div className='flex  flex-col justify-center items-center gap-2 w-full mt-4'>
            <p className=' font-semibold text-gray-700 cursor-pointer '>Hobbies</p>
            <div className="flex flex-wrap gap-2 mt-2">
            {user?.hobbies?.map((hobby, index) => {
              return (
                <div key={index}>
                {
                  index <= 3 &&
                  <span className="bg-gray-100 text-sm px-3 py-1 rounded-full border">{hobby}</span>
                }
                {
                  index == 4 &&
                  <span className="bg-gray-100 text-sm px-3 py-1 rounded-full border">....</span>
                }
                </div>
              )
            }
            )}
            <button onClick={()=>{setModalIsOpenV3(true); setHobbies(user?.hobbies || [])}} className="text-sm text-blue-600 underline hover:text-blue-800">Edit</button>
            </div>
          </div>
          <div className='flex justify-center items-center gap-2 w-full mt-7'>
            {/* Email Field */}
            <div>
              <span className='text-xs text-gray-500'>Email</span>
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <p className='text-gray-500 py-1 px-2 text-sm cursor-pointer hover:text-gray-300 text-ellipsis'>{user?.email}</p>
                <button onClick={()=>{ChangeEmailPassword('email')}} className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[material-symbols--edit-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* Password Field */}
            <div>
              <span className='text-xs text-gray-500'>Password</span>
              <div className='border h-[30px] w-[250px] overflow-hidden rounded-sm flex justify-between items-center'>
                <input disabled type='password' value='********' className='text-gray-500 py-1 px-2 text-sm cursor-pointer hover:text-gray-300 text-ellipsis'></input>
                <button onClick={()=>{ChangeEmailPassword('password')}} className='border m-0 h-full px-1 border-y-0 bg-gray-50 border-r-0 flex justify-center items-center'>
                <span className="icon-[material-symbols--edit-outline] text-gray-500"></span>
                </button>
              </div>
            </div>
            {/* <span className="icon-[mdi--email-outline] text-gray-700 text-xl"></span>
            {
                <p onClick={() => setIsOpen(true)} className='text-gray-500 cursor-pointer hover:text-gray-300'>{user?.email}</p>
            } */}

          </div>
        </section>
      </div>
      <EmailAndPasswordDB input={input} isOpen={modalIsOpenV2} setIsOpen={setModalIsOpenV2} />
      <Modal isOpen={modalIsOpen} style={modalStyle}>
        <div className='h-fit w-[500px] flex flex-col gap-3 overflow-hidden '>
          <div className='w-full flex gap-2'>
            <div className='h-[50px] bg-gray-700 rounded-sm w-[5px]'></div>
            <div>
              <h3 className=' text-xl font-medium'>Select your address</h3>
              <p className='text-sm text-gray-500'>This will be displayed on your profile</p>
            </div>
          </div>
          <hr className='my-1'></hr>
          {/* Dropdowns */}
          <div className='grid grid-cols-2 gap-5 justify-start items-start'>
            {/* Province Dropdown */}
            <div className="flex flex-col gap-1">
              <p className='text-sm text-gray-500'>Province</p>
              <Select
                classNames={{
                  menu: () => 'text-sm'
                }}
                // menuClassName='absolute z-10 max-h-[200px] overflow-y-auto bg-white shadow-md'
                placeholder="Select Province"
                options={addressOptions.province.map((prov) => ({
                  value: prov.code,
                  label: prov.name,
                }))}
                value={address.province && {value : address.province.code
                  ,label : address.province.name}}
                onChange={(e: any) => {
                  getAddressOptions(
                    e.value,
                    `https://psgc.gitlab.io/api/provinces/${e.value}/cities-municipalities/`,
                    'city'
                  ),
                  setAddress({
                      ...address,
                      barangay: {name : '', code : ''},
                      city: {name : '', code : ''},
                      province: {name : e.label, code : e.value}
                  }),
                  setAddressOptions((prevAddress) => (
                    {
                      ...prevAddress,
                      barangay: [],
                    }
                  ))
                }

                }
              />
              <span>{error.province && <p className='text-red-500 text-xs'>Please select a province</p>}</span>
            </div>

            {/* City Dropdown */}
            <div className="flex flex-col gap-1">
              <p className='text-sm text-gray-500'>City</p>
              <Select
                classNames={{
                  menu: () => 'text-sm'
                }}
                placeholder="Select City"
                options={addressOptions.city.map((prov) => ({
                  value: prov.code,
                  label: prov.name,
                }))}
                value={address.city && {value : address.city.code
                  ,label : address.city.name}}
                onChange={(e: any) => {
                  getAddressOptions(
                    e.value,
                    `https://psgc.gitlab.io/api/cities-municipalities/${e.value}/barangays/`,
                    'barangay'
                  ),
                    setAddress({
                      ...address,
                      barangay: {name : '', code : ''},
                      city: {name : e.label, code : e.value}
                    }),
                    setAddressOptions((prevAddress) => (
                      {
                        ...prevAddress,
                        barangay: [],
                      }
                    ))
                }
                }
              />
              <span>{error.city && <p className='text-red-500 text-xs'>Please select a city</p>}</span>
            </div>

            {/* Barangay Dropdown */}
            <div className="flex flex-col gap-1 col-span-2">
              <p className='text-sm text-gray-500'>Barangay</p>
              <Select
                menuPlacement='top'
                classNames={{
                  menu: () => 'text-sm'
                }}
                placeholder="Select Barangay"
                options={addressOptions.barangay.map((prov) => ({
                  value: prov.code,
                  label: prov.name,
                }))}
                value={address.barangay && {value : address.barangay.code
                  ,label : address.barangay.name}}
                onChange={(e: any) => {
                  setAddress({
                    ...address,
                    barangay: {name : e.label, code : e.value}
                  })
                }
                }
              />
              <span>{error.barangay && <p className='text-red-500 text-xs'>Please select a barangay</p>}</span>
            </div>

          </div>
          {/* Buttons */}
          <div className='flex gap-3'>
            <button onClick={() => handleSubmit()} className='flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded border px-2 py-1 text-gray-700 text-sm mt-4 '>
            {
              loading ?
              <span className='text-gray-500 text-sm'>Loading...</span>
              :
              <span className='text-gray-500 text-sm'>Submit</span>
            }
            </button>
            <button onClick={() => setIsOpen(false)} className='flex items-center justify-center bg-slate-50 rounded px-2 py-1 text-gray-700 text-sm mt-4 '>Cancel</button>
          </div>
        </div>
      </Modal>
      {/* Hobbies Modal  */}
      <Modal isOpen={modalIsOpenV3} style={modalStyle}>
        <div className='h-fit w-[300px] flex flex-col gap-3 overflow-hidden '>
          <div className='w-full flex gap-2'>
            <div className='h-[50px] bg-gray-700 rounded-sm w-[5px]'></div>
            <div>
              <h3 className=' text-xl font-medium'>Edit Hobbies</h3>
              <p className='text-sm text-gray-500'>Add or edit your hobbies</p>
            </div>
          </div>
          {/* Hobbies Field */}
          <div className='flex flex-col'> 
            <div className='flex flex-wrap gap-2 mt-2'>
            {hobbies.map((hobby, index) => {
              return (
                <div key={index} className='relative'>
                  <button onClick={()=> handleRemoveHobby(index)} className='absolute -right-2 -top-2 z-20'>
                    <span className="icon-[lets-icons--remove-fill] text-red-500 text-lg"></span>
                  </button>
                  <span className="bg-gray-100 text-sm px-3 py-1 rounded border">{hobby}</span>
                </div>
              )
            }
            )}
            </div>
            {/* input field */}
            <div className='flex justify-center items-center gap-2 w-full mt-4'>
              <input onKeyDown={(e) => {if(e.key == 'Enter'){handleAddHobby()}}} value={hobby} onChange={(e : any) => setHobby(e.target.value)} type='text' placeholder='Add hobby' className='w-full h-9 rounded border bg-gray-50 px-3 text-black font-normal text-[0.8rem] focus:outline-none focus:border-theme_semidark focus:ring-theme_semidark' />
            </div>
            {/* Submit button */}
            <div className='flex justify-start items-center w-full mt-0'>
              <button onClick={() => {saveHobbies()}} className='flex items-center justify-center bg-theme_normal rounded border px-2 py-1 text-gray-100 text-sm mt-4 '>
              {
                loading ?
                <span className='text-gray-100 text-sm'>Loading...</span>
                :
                <span className='text-gray-100 text-sm'>Save</span>
              }
              </button>
              <button onClick={() => setModalIsOpenV3(false)} className='flex items-center justify-center bg-slate-50 rounded px-2 py-1 text-gray-700 text-sm mt-4 '>Cancel</button>
            </div>
          </div>
        
        </div>
      </Modal>

    </div>
  )
}
Modal.setAppElement('#root')
export default UserProfile
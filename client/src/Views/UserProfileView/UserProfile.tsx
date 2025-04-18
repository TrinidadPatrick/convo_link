import React, { useEffect, useRef, useState } from 'react'
import SocketStore from '../../store/SocketStore'
import { useAuthContext } from '../../Auth/AuthProvider'
import bg from '../../utilities/images/Guest_bg.jpg'
import Userimage from '../../ReusableComponents/Userimage'
import Modal from 'react-modal';
import axios from 'axios'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import Select from 'react-select'
import http from '../../../http'

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

const UserProfile = () => {
  const didRun = useRef(false);
  const { socket }: any = SocketStore()
  const { isAuthenticated, user } = useAuthContext()
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [addressOptions, setAddressOptions] = useState<AddressType>({
    province: [],
    barangay: [],
    city: []
  });
  const [address, setAddress] = useState<Object>({
    province: {name : '', code : ''},
    barangay: {name : '', code : ''},
    city: {name : '', code : ''}
  })
  const [error, setError] = useState<ErrorType>({
    province: false,
    barangay: false,
    city: false
  })

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
      setAddressOptions({ ...addressOptions, [key]: result.data.sort((a: any, b: any) => a.name > b.name ? 1 : -1) })
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if(!user || addressOptions.province.length == 0)
    {
      getAddressOptions('', 'https://psgc.gitlab.io/api/provinces/', 'province')
    }
  }, [user, addressOptions])

  const handleSubmit = async () => {
    let hasError = false;
    Object.entries(address).forEach(([key, value]) => {
      if (value == '') {
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
        console.log(result.data)
      } catch (error) {
        console.log(error)
      }
    }

  }

  console.log('address')

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
              <Userimage className='flex rounded-full items-center justify-center aspect-square bg-gray-200 shadow-lg' firstname={user?.firstname} lastname={user?.lastname} size={35} width={130} height={130} />
            </div>
          </div>
          {/* Name and bio */}
          <div className='flex flex-col gap-1 w-full'>
            <span className='text-[1.7rem] text-center font-medium text-gray-600'>{user?.firstname} {user?.lastname}</span>
            <p className='text-center text-gray-500'>{user?.userBio}</p>
          </div>

          {/* Address */}
          <div className='flex flex-col items-center gap-1 w-full mt-7'>
            <span className="icon-[tdesign--location] text-gray-500 text-2xl"></span>
            {
              user?.Address ?
                <p onClick={() => setIsOpen(true)} className='text-gray-500 underline cursor-pointer'>{user?.Address.barangay.name} {user?.Address.city.name}, {user.Address.province.name}</p>
                :
                <p onClick={() => setIsOpen(true)} className='text-gray-400 underline cursor-pointer hover:text-gray-300'>Setup Address</p>
            }

          </div>
        </section>
      </div>

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
                defaultValue={{value : addressOptions?.province.find((prov) => prov.code == user?.Address.province.code)?.code
                ,label : user?.Address.province.name}}
                onChange={(e: any) => {
                  getAddressOptions(
                    e.value,
                    `https://psgc.gitlab.io/api/provinces/${e.value}/cities-municipalities/`,
                    'city'
                  ),
                    setAddress({
                      ...address,
                      province: {name : e.label, code : e.value}
                    })
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
                defaultValue={{value : addressOptions?.city.find((city) => city.code == user?.Address.city.code)?.code
                  ,label : user?.Address.city.name}}
                onChange={(e: any) => {
                  getAddressOptions(
                    e.value,
                    `https://psgc.gitlab.io/api/cities-municipalities/${e.value}/barangays/`,
                    'barangay'
                  ),
                    setAddress({
                      ...address,
                      city: {name : e.label, code : e.value}
                    })
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
                defaultValue={{value : addressOptions?.barangay.find((brgy) => brgy.code == user?.Address.barangay.code)?.code
                  ,label : user?.Address.barangay.name}}
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
            <button onClick={() => handleSubmit()} className='flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded border px-2 py-1 text-gray-700 text-sm mt-4 '>Submit</button>
            <button onClick={() => setIsOpen(false)} className='flex items-center justify-center bg-slate-50 rounded px-2 py-1 text-gray-700 text-sm mt-4 '>Cancel</button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
Modal.setAppElement('#root')
export default UserProfile
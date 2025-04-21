import React from 'react'
import Modal from 'react-modal'
import Userimage from './Userimage'

const ShowUserInfo = (props : any) => {
    const {user, handleRemoveHover} = props
    const {userInfo, isOnline} = user
    const modalStyle = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border : '0'
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // Change this to any color
            cursor: 'pointer'
        }
    };

  return (
    <Modal onRequestClose={()=>handleRemoveHover()} isOpen={true} overlayClassName="" style={modalStyle}>
        <div className="flex flex-col w-[400px] items-center gap-2 ">
          <Userimage className='flex w-[100px] aspect-square object-cover rounded-full items-center justify-center bg-gray-200 ' firstname={userInfo.firstname} lastname={userInfo.lastname} size={50} width={100} height={100} image={userInfo.profileImage} />
          <h2 className="text-2xl font-bold tracking-tight">{userInfo.firstname} {userInfo.lastname}</h2>
          <p className="text-sm text-gray-500 mt-1">{userInfo.userBio}</p>
          <span className={`text-sm px-3 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>

          {
            userInfo?.Address &&
            <div className="w-full mt-4 flex justify-center items-center gap-2">
          <span className="icon-[tabler--location] text-gray-600"></span>
            <p className="text-sm text-gray-500">
                {userInfo.Address?.barangay?.name} {userInfo.Address?.city?.name}, {userInfo.Address?.province?.name}
            </p>
          </div>
          }
          {/* User hobbies, static data for now */}
          <div className="w-full mt-4 flex justify-center items-center flex-col gap-0">
            <h3 className="text-md font-medium mb-1 text-gray-700">Hobbies</h3>
            <div className="flex flex-wrap justify-items-start gap-2 mt-2 max-h-[150px] overflow-y-auto">
            {userInfo.hobbies?.map((hobby : string, index : number) => (
                <span
                key={index}
                className="px-3 py-1 bg-theme_semilight text-sm text-gray-100 rounded-full border border-gray-300"
                >
                {hobby}
                </span>
            ))}
            </div>
          </div>
        </div>


    </Modal>
  )
}

export default ShowUserInfo
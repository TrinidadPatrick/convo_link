import { create } from 'zustand'

interface FRstoreType {
    FriendRequests : any,
    setFriendRequests: (value : any) => void
}

const FriendRequestStore = create<FRstoreType>((set) => ({
    FriendRequests: null, 
    setFriendRequests: (value : any) => set(() => ({ FriendRequests: value })),
  }))

  export default FriendRequestStore
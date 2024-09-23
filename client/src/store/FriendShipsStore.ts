import { create } from 'zustand'

interface FsstoreType {
    Friendships : any,
    setFriendShips: (value : any) => void
}

const FriendShipStore = create<FsstoreType>((set) => ({
    Friendships: null, 
    setFriendShips: (value : any) => set(() => ({ Friendships: value })),
  }))

  export default FriendShipStore
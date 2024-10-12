import { create } from 'zustand'

interface FstoreType {
    Friends : any,
    setFriends: (value : any) => void
}

const FriendsStore = create<FstoreType>((set) => ({
    Friends: null, 
    setFriends: (value : any) => set(() => ({ Friends : value })),
  }))

  export default FriendsStore
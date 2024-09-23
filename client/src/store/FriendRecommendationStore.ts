import { create } from 'zustand'

interface FrstoreType {
    FriendRecommendation : any,
    setFriendRecommendation: (value : any) => void
}

const FriendRecommendationStore = create<FrstoreType>((set) => ({
    FriendRecommendation: null, 
    setFriendRecommendation: (value : any) => set(() => ({ FriendRecommendation: value })),
  }))

  export default FriendRecommendationStore
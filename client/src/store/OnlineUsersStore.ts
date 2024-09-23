import { create } from 'zustand'

interface OnlineUserType {
    onlineUsers : Array<any> | null,
    setOnlineUsers: (value : any) => void
}

const onlineUserStore = create<OnlineUserType>((set) => ({
    onlineUsers: null,
    setOnlineUsers: (value : any) => set(() => ({ onlineUsers: value })),
  }))

  export default onlineUserStore
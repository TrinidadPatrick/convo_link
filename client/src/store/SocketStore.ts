import { create } from 'zustand'

interface SocketStoreType {
    socket : any,
    setSocket: (value : any) => void
}

const SocketStore = create<SocketStoreType>((set) => ({
    socket: null,
    setSocket: (value : any) => set(() => ({ socket: value })),
  }))

  export default SocketStore
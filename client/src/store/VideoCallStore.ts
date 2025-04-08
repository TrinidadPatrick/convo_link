import { create } from 'zustand'

interface VideoCallStoreType {
    vcObject : any,
    setVcObject: (value : any) => void
}

const VideoCallStore = create<VideoCallStoreType>((set) => ({
    vcObject: null,
    setVcObject: (value : any) => set(() => ({ vcObject: value })),
  }))

  export default VideoCallStore
import { create } from 'zustand'

interface ConversationType {
    Conversations : Array<Conversation> | [],
    setConversations: (value : Array<Conversation>) => void
}

interface ConversationInfo{
    _id : string,
    conversationId : string,
    participants : Array<Object | undefined>,
    createdAt : Date,
    updatedAt : Date,
    lastMessage : Object,
    isGroup : boolean
}

interface Conversation{
        conversationInfo : ConversationInfo,
        user : {
            _id : string,
            firstname : string,
            lastname : string,
            profileImage : string,
            userBio : string,
            profile_status : string
        },
        messages : Array<any>,
}

const ConversationStore = create<ConversationType>((set) => ({
    Conversations: [], 
    setConversations: (value : Array<Conversation>) => set(() => ({ Conversations : value })),
  }))

  export default ConversationStore
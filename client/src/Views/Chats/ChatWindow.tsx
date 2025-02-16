import React, { useEffect, useState } from 'react'
import FriendsStore from '../../store/FriendsStore'
import { useParams } from 'react-router-dom'
import http from '../../../http'
import Userimage from '../../ReusableComponents/Userimage'
import { useAuthContext } from '../../Auth/AuthProvider'
import SocketStore from '../../store/SocketStore'
import ConversationStore from '../../store/ConversationStore'
import onlineUserStore from '../../store/OnlineUsersStore'
import { useLocation } from 'react-router-dom'

interface ConversationInfo{
    headId? : string | undefined,
    _id? : any,
    // conversationId : string,
    participants : Array<Object | undefined>,
    createdAt : Date,
    updatedAt : Date,
    lastMessage : Object,
    isGroup : boolean
}

interface Conversation{
        conversationInfo : ConversationInfo,
        user? : {
            _id : string,
            firstname : string,
            lastname : string,
            profileImage : string,
            userBio : string,
            profile_status : string
        },
        messages : Array<Message>
}

interface Message {
    conversationId: string;
    headId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isRead: boolean;
    messageType: string;
}

interface Props {
    handleGetConversations : () => void
}

const ChatWindow : React.FC<Props> = ({handleGetConversations} : Props) => {
    const location = useLocation();
    const {socket} = SocketStore()
    const {onlineUsers} = onlineUserStore();
    const {Conversations, setConversations} = ConversationStore() //This is the list of messages not just conversation
    const {user} = useAuthContext()
    const {_id, option} = useParams()
    // T is for userID and E is for conversationID
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messageContent, setMessageContent] = useState<string>('')

    const openChatWindow = () => {
        const chatWindow = window.open(
          window.location.origin + '/vc', // Change this to your video call URL
          "ChatWindow",
          "width=800,height=600,left=300,top=100,resizable=yes"
        );
      
        if (chatWindow) {
          chatWindow.focus();
        }
      };

    const generateRandomId = () => {
        // Combining timestamp with a random number
        const newId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        return newId;
      };
    
    const getConversations = async () => {
        // Deletes the old conversation from the store where its null
        const newConversations = [...Conversations];
        const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation?.user?._id == _id)
        if(conversationIndex !== -1 && newConversations[conversationIndex].conversationInfo == null)
        {
            newConversations.splice(conversationIndex, 1);
        }
        try {
            // Find the conversation in the existing store
            const conversation = newConversations.find((conversation : Conversation) => conversation?.conversationInfo?._id == _id)
            if(conversation)
            {
                setConversation(conversation)
            }
            // Then get the latest conversation from the database and put it in the store
            const result = await http.get('getConversations?option='+option+'&_id='+_id, {withCredentials: true})
            const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation?.conversationInfo?._id == result.data.conversationInfo._id)
            if(conversationIndex == -1)
            {
                setConversations([...newConversations, result.data])
                setConversation(result.data)
            }
            else
            {
                setConversations([...newConversations.slice(0, conversationIndex), result.data, ...newConversations.slice(conversationIndex + 1)])
                setConversation(result.data)
            }
        } catch (error : any) {
            console.log(error)
        }
    }

    const updateConversations = (conversationData : any, messageData : any, conversations : any) => {
        // Create an instance of the Conversations store array
        const newData = [...conversations]
        const conversationIndex = newData.findIndex((conversation : Conversation) => conversation.conversationInfo._id == conversationData?._id)
            if(conversationIndex !== -1)
            {
                const messageIndex = newData[conversationIndex].messages.findIndex((msg : any) => msg.headId == messageData?.headId)
                newData[conversationIndex].messages.splice(messageIndex, 1, messageData)
                newData[conversationIndex].conversationInfo = conversationData
                setConversations(newData)
            }
    }


    const sendMessage = async () => {
        const newConversations = [...Conversations];
        const messageContentData = {
            headId: generateRandomId(),
            senderId: user?._id,
            content: messageContent,
            createdAt: new Date(),
            updatedAt: new Date(),
            isRead: false,
            messageType: 'text',
        };

        // All the message data compressded into one object
        const conversationData : any = {
            conversationInfo: {
              headId: conversation?.conversationInfo?.headId || generateRandomId(),
              _id: conversation?.conversationInfo?._id,
              participants: conversation?.conversationInfo?.participants || [{ userId: user?._id }, { userId: conversation?.user?._id }],
              createdAt: conversation?.conversationInfo?.createdAt || new Date(),
              updatedAt: new Date(),
              lastMessage: messageContent,
              isGroup: false,
            },
            message: messageContentData,
            user: conversation?.user,
        };

        // Store the message locally if its not new message
        if(conversation?.conversationInfo !== null)
        {
            // Find the index of the conversation in the store
           const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation.conversationInfo._id == conversationData.conversationInfo._id)
           if(conversationIndex !== -1)
           {
               // Update the conversation in the store
               newConversations[conversationIndex].conversationInfo = conversationData.conversationInfo;
               newConversations[conversationIndex].messages = [...newConversations[conversationIndex].messages, messageContentData];
               setConversations(newConversations);
           }
        }

        // Store the message to database
        try {
                const result = await http.post(`sendMessage`, conversationData, {withCredentials: true})
                if(conversation?.conversationInfo == null)
                {
                    getConversations()
                }
                else
                {
                    updateConversations(result.data.conversation , result.data.newMessage, newConversations)
                }
                socket?.emit("notification_send", {type : 'newMessage', receiver : conversation?.user?._id})
                setMessageContent("")
                handleGetConversations()
        } catch (error) {
            console.log(error)
        }
            
    }

    useEffect(() => {
        getConversations()
        return () => {
        }
    }, [])
    
    // real time notification
    useEffect(() => {
        socket?.on('notification_receive', (data : any) => {
            if(data == 'newMessage')
            {
                getConversations()
            }
        })
    }, [socket])
    
  return (
    <div className=' w-full h-full flex flex-col overflow-hidden'>
        {/* Header */}
        <section className='w-full flex justify-between shadow-sm p-2'>
            {/* Profile Information */}
            <div className='h-full flex gap-2'>
                {/* Image */}
                <div className='flex h-full'>
                <Userimage firstname={conversation?.user?.firstname} lastname={conversation?.user?.lastname} size={25} width={45} height={44} /> 
                </div>
                {/* Name and bio */}
                <div className='flex flex-col  '>
                    <span className='text-[1rem] font-medium text-gray-800'>{conversation?.user?.firstname} {conversation?.user?.lastname}</span>
                    {
                        onlineUsers?.some((user : any)=> user.user_id == conversation?.user?._id) ?
                        <p className='text-[0.8rem] text-green-500'>Online</p>
                        :
                        <p className='text-[0.8rem] text-gray-500'>Offline</p>
                    }
                </div>
            </div>
            {/* Other options */}
            <div className='flex gap-4 px-5'>
                <button className='flex items-center justify-center   '>
                    <span className="icon-[fluent--call-16-regular] text-2xl text-gray-400"></span>
                </button>
                <button onClick={()=> openChatWindow()} className='flex items-center justify-center  '>
                    <span className="icon-[weui--video-call-outlined] text-2xl text-gray-400"></span>
                </button>
                <button className='flex items-center justify-center  '>
                <span className="icon-[material-symbols-light--info-outline] text-2xl text-gray-400"></span>
                </button>
            </div>
        </section>
        {/* Messages */}
        <div className='flex-1 w-full h-full flex flex-col overflow-auto '>
        {
            conversation?.messages?.sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((message : any, index : number) => {
                const isSender = message?.senderId?._id == user?._id || message?.senderId == user?._id
                const isReceiver = message?.senderId?._id != user?._id || message?.senderId == user?._id
                const timeStamp = new Date(message?.createdAt).toLocaleTimeString('PH', {hour12: true, minute:'2-digit', hour : 'numeric'})
                return (
                    <div key={index} className={`flex ${isSender ? 'justify-end' : 'justify-start'} w-full gap-0 p-2`}>
                        {/* Profile information */}
                        <div className='flex gap-2'>
                        <div className={` ${isSender ? 'hidden' : 'flex'} h-full pb-3 flex-col justify-end`}>
                            <Userimage firstname={message?.senderId?.firstname} lastname={message?.senderId?.lastname} size={12} width={25} height={25} /> 
                        </div>
                        {/* Message */}
                        <div className={` flex flex-col gap-0 `}>
                            <p className={`${isSender ? 'bg-theme_normal text-white' : 'bg-gray-100 text-gray-700'} py-1.5 px-2.5 rounded  shadow-sm text-sm `}>{message?.content}</p>
                            <p className={`text-[0.65rem] ${isSender ? 'text-right' : 'text-left'} text-gray-500`}>{timeStamp}</p>
                        </div>
                        </div>
                    </div>
                )
            })
        }
        </div>
        {/* Input */}
        <div className='flex w-full p-2 '>
            {/* Input text */}
            <div className='w-full h-full items-center flex relative'>
                <textarea onKeyDown={(e)=>{if(e.key == 'Enter' && !e.shiftKey){e.preventDefault(); sendMessage()}}} value={messageContent} onChange={(e : React.ChangeEvent<HTMLTextAreaElement>)=>setMessageContent(e.target.value)} rows={1} placeholder="Type a message" className='w-full py-3 resize-none rounded-md bg-slate-100 pt-2.5 ps-3 pe-3 text-gray-700 font-normal text-base ' />
                <div className='absolute  right-4 top-2.5 items-center  justify-evenly flex gap-2'>
                <button className=' flex items-center'>
                    <span className="icon-[iconoir--attachment] text-gray-500 text-lg"></span>
                </button>
                <button className=' flex items-center'>
                    <span className="icon-[iconoir--emoji] text-gray-500 text-lg"></span>
                </button>
                <div className='w-[1px] h-7 bg-gray-400'></div>
                <button onClick={()=>sendMessage()} className='flex items-center rotate-45'>
                    <span className="icon-[lucide--send] text-gray-500 text-xl "></span>
                </button>
                </div>
            </div>
        </div>

    </div>
  )
}

export default ChatWindow
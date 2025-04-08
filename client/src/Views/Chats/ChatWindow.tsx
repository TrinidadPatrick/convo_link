import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react'
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

export type ChatWindowRef = {
    handleGetConversations: () => void;
  };

const ChatWindow  = forwardRef<ChatWindowRef, Props>((props, ref) => {
    const location = useLocation();
    const {socket} = SocketStore()
    const {onlineUsers} = onlineUserStore();
    const {Conversations, setConversations} = ConversationStore() //This is the list of messages not just conversation
    const {user} = useAuthContext()
    const {_id, option} = useParams()
    // T is for userID and E is for conversationID
    const [userId, setUserId] = useState<string>('')
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messageContent, setMessageContent] = useState<string>('')
    const bottomRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const limit = 10;

    useImperativeHandle(ref, () => ({
        handleGetConversations: () => getConversations(10,1, true)
    }));

    const scrollToBottom = () => {
        if(bottomRef.current)
        {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }


    const generateRandomId = () => {
        // Combining timestamp with a random number
        const newId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        return newId;
    };

    const load_more_conversation = async (limit : number, page : number, fetchLatest : boolean) => {
        // Deletes the old conversation from the store where its null
        const newConversations = [...Conversations];
        const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation?.user?._id == _id)
        if(conversationIndex !== -1 && newConversations[conversationIndex].conversationInfo == null)
        {
            newConversations.splice(conversationIndex, 1);
        }
        try {
            // Find the conversation in the existing store
            const conversation = newConversations.find((conversation : Conversation) => conversation?.conversationInfo?.participants.some((participant : any) => participant.userId == _id))
            // Then get the latest conversation from the database and put it in the store
            const result = await http.get('getConversations?option='+option+'&_id='+_id+'&limit='+limit+'&page='+page, {withCredentials: true})
            // sets the url parameter to the conversation
            if(result.data.NVP)
            {
                const optionResult = result.data.conversationInfo.isGroup ? 'g' : 't'
                window.history.pushState(null, '', `/chats/${optionResult}/${result.data.user._id}`)
            }
            
            // Get conversation index from store
            const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation?.conversationInfo?._id == result.data.conversationInfo._id)
            if(conversationIndex == -1)
            {
                setConversations([...newConversations, result.data])
                setConversation(result.data)
            }
            // If conversation index is not -1 then update the conversation in the store
            else
            {
                const updatedConversation = {
                    ...newConversations[conversationIndex],
                    messages: [
                      ...result.data.messages, // prepend older messages (page 2, 3, etc.)
                      ...newConversations[conversationIndex].messages
                    ]
                  };
                  setConversations([
                    ...newConversations.slice(0, conversationIndex),
                    updatedConversation,
                    ...newConversations.slice(conversationIndex + 1),
                  ]);

                setConversation((prev : any) => ({
                    ...prev,
                    messages: [...result.data.messages, ...prev.messages]
                  }));
                  
            }
        } catch (error : any) {
            console.log(error)
        }
    }
    
    const getConversations = async (limit : number, page : number, fetchLatest : boolean) => {
        // Deletes the old conversation from the store where its null
        const newConversations = [...Conversations];
        const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation?.user?._id == _id)
        if(conversationIndex !== -1 && newConversations[conversationIndex].conversationInfo == null)
        {
            newConversations.splice(conversationIndex, 1);
        }
        try {
            
            // Find the conversation in the existing store
            const conversation = newConversations.find((conversation : Conversation) => conversation?.conversationInfo?.participants.some((participant : any) => participant.userId == _id))
            if(conversation && page == 1 && !fetchLatest)
            {
                setConversation(conversation)
                // return
            }
            // Then get the latest conversation from the database and put it in the store
            const result = await http.get('getConversations?option='+option+'&_id='+_id+'&limit='+limit+'&page='+page, {withCredentials: true})
            // sets the url parameter to the conversation
            if(result.data.NVP)
            {
                const optionResult = result.data.conversationInfo.isGroup ? 'g' : 't'
                window.history.pushState(null, '', `/chats/${optionResult}/${result.data.user._id}`)
            }
            // Get conversation index from store
            const conversationIndex = newConversations.findIndex((conversation : Conversation) => conversation?.conversationInfo?._id == result.data.conversationInfo._id)
            if(conversationIndex == -1)
            {
                // console.log("Hello")
                setConversations([...newConversations, result.data])
                setConversation(result.data)
            }
            // If conversation index is not -1 then update the conversation in the store
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

    useEffect(() => {
        scrollToBottom()
    }, [conversation])

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

           setTimeout(() => {
            scrollToBottom()
           }, 500);
        }

        // Store the message to database
        try {
                const result = await http.post(`sendMessage`, conversationData, {withCredentials: true})
                if(conversation?.conversationInfo == null)
                {
                    getConversations(limit, page, false)
                }
                else
                {
                    updateConversations(result.data.conversation , result.data.newMessage, newConversations)
                }
                socket?.emit("message_notification_send", {type : 'newMessage', receiver : conversation?.user?._id})
                setMessageContent("")
                props.handleGetConversations()
        } catch (error) {
            console.log(error)
        }
            
    }

    useEffect(() => {  
        if(page > 1)
        {
            load_more_conversation(limit, page, false)
        }
    }, [page])

    useEffect(() => {
        const fetchConversation = async () => {
          setIsLoading(true);
          await getConversations(10, 1, true);
          setIsLoading(false);
        };
      
        const timeout = setTimeout(() => {
          fetchConversation();
        }, 5);
      
        return () => {
          clearTimeout(timeout); // Clean up timeout on unmount or re-run
        };
      }, [option, _id]);
      
    
    // real time notification
    useEffect(() => {
        socket?.on('message_notification', (data : any) => {
            if(data == 'newMessage')
            {
                console.log(_id)
                getConversations(10, 1, true)
            }
        })

        return () => {
            // socket?.off('message_notification', getConversations(10, 1));
          };
    }, [socket, _id])

    
  return (
    <div className=' w-full h-full flex flex-col overflow-hidden'>
        {/* Header */}
        <section className='w-full flex justify-between shadow-sm p-2'>
            {/* Profile Information */}
            {
                isLoading ?
                <div className="relative flex w-64 animate-pulse gap-2 p-0.5">
              <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                <div className="flex-1">
                  <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-200 text-lg"></div>
                  <div className="h-5 w-[90%] rounded-lg bg-slate-200 text-sm"></div>
                </div>
              <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-200"></div>
          </div>
                :
                <>
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
                    {/* <button className='flex items-center justify-center   '>
                        <span className="icon-[fluent--call-16-regular] text-2xl text-gray-400"></span>
                    </button>
                    <button onClick={()=> openVcWindow()} className='flex items-center justify-center  '>
                        <span className="icon-[weui--video-call-outlined] text-2xl text-gray-400"></span>
                    </button> */}
                    <button className='flex items-center justify-center  '>
                    <span className="icon-[material-symbols-light--info-outline] text-2xl text-gray-400"></span>
                    </button>
                </div>
                </>
            }
            
        </section>
        {/* Messages */}
        <div className='flex-1 w-full h-full flex flex-col overflow-auto '>
        {
            isLoading ?
            <div role="status" className=" animate-pulse w-full h-full px-5 flex flex-col justify-evenly">
            <div className="h-5 bg-slate-200 rounded-full  w-48 mb-4"></div>
            <div className="h-5 bg-slate-200 rounded-full  max-w-[60%] "></div>
            <div className="h-5 bg-slate-200 rounded-full  max-w-[80%]"></div>
            <div className="h-5 bg-slate-200 rounded-full  max-w-[70%] "></div>
            <div className="h-5 bg-slate-200 rounded-full  max-w-[50%] "></div>
            <div className="h-5 bg-slate-200 rounded-full  max-w-[360px] "></div>
            <div className="h-5 bg-slate-200 rounded-full  max-w-[65%]"></div>
            <span className="sr-only">Loading...</span>
            </div>
        :
        <>
            <div className='w-full flex justify-center'>
                <button className='flex items-center justify-center' onClick={()=>setPage((prev)=> prev + 1)}>
                {/* ()=>setPage((prev)=> prev + 1) */}
                    <span className="icon-[fluent:arrow-down-16-filled] text-2xl text-gray-400">s</span>
                </button>
            </div>
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
        <div ref={bottomRef}></div>
        </>
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
})

export default ChatWindow
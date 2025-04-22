const User = require("../Models/userModel");
const Conversation = require("../Models/ConversationModel");
const Message = require("../Models/MessageModel");
const Friendship = require("../Models/FriendShipModel");

// Get the scpecific conversation of user
module.exports.getConversations = async (req, res) => {
  const userId = req.user._id;
  const _id = req.query._id; //_id of the user the user is chatting with
  const option = req.query.option;
  const limit = req.query.limit;
  const page = req.query.page;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // If there is a valid parameters
  if(_id != 'undefined' && option != 'undefined')
  {
    const isUserFriend = await Friendship.countDocuments({
      participants: { $all: [userId, _id] },
      status: 'accepted'
    });
  
    // User is not friends with the user you are trying to chat with
    if(!isUserFriend)
    {
      return res.status(400).json({ message: "User is not friends with the user you are trying to chat with"});
    }
    
    if(option == 't') //Meaning get conversation using user id not convo iD
    {
      const conversation = await Conversation.findOne({
          $and: [
            { participants: { $elemMatch: { userId: userId } } },
            { participants: { $elemMatch: { userId: _id } } }
          ],
          isGroup: false
        }).populate('lastMessage.messageId', 'content createdAt readBy senderId');  
      
      // get the user information
      const user = await User.findOne({_id, isDeactivated : false, email_verified : true, 'account_status.status' : 'Active'}).select('_id firstname lastname profileImage userBio hobbies Address');
      if(!user)
      {
          return res.status(400).json({ message: "User not found"});
      }
  
      // If fetched a conversation
      if(conversation)
      {
          const messages = await Message.find({ conversationId: conversation._id }).sort({createdAt : 1})
          .populate("senderId", "firstname lastname profileImage userBio profile_status")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
          return res.status(200).json({conversationInfo : conversation, messages, user });
      }
      // If not fetched a conversation
      return res.status(200).json({conversationInfo : null, messages : [], user });
    }
  }


  // If there is no valid parameters means get the latest conversation
  else
  {
      const conversations = await Conversation.find({
        $and: [
          { participants: { $elemMatch: { userId: userId } } }
        ],
      }).populate('lastMessage.messageId', 'content createdAt readBy senderId')
      .sort({ 'lastMessage.timestamp': -1 })
      .limit(1);
    // If fetched a conversation
    if(conversations.length > 0)
    {
        // get the user information
        const _id = conversations[0].participants.find((participant)=> participant.userId != userId).userId;
        const user = await User.findOne({_id, isDeactivated : false, email_verified : true, 'account_status.status' : 'Active'}).select('_id firstname lastname profileImage userBio hobbies Address');
        const option = conversations[0].isGroup ? 'g' : 't';
        const conversationId = conversations[0]._id;
        // console.log(user)
        if(!user)
        {
            return res.status(400).json({ message: "User not found"});
        }
        const messages = await Message.find({ conversationId: conversationId }).sort({createdAt : 1})
        .populate("senderId", "firstname lastname profileImage userBio profile_status")
        .sort({ createdAt: -1 })
        .limit(50);
        return res.status(200).json({conversationInfo : conversations[0], messages, user, NVP : true });
    }
    //If not fetched a conversation
    return res.status(400).json({conversationInfo : null, messages : [], user: null  });
  }
  
};


// Handles the sending of messages
module.exports.sendMessage = async (req,res) => {
  const data = req.body;
  const userId = req.user._id;
  const {message, conversationInfo} = data;


  // Meaning this is a new conversation-------------------------------------
  if(!conversationInfo._id)
  {
    // Create a new conversation
    const conversation = new Conversation(conversationInfo);
    await conversation.save();

    // Create a new message
    const newMessage = await Message.create({...message, conversationId : conversation._id, readBy : [userId]});
    conversation.lastMessage.messageId = newMessage._id;
    conversation.lastMessage.timestamp = newMessage.createdAt;
    await conversation.save();
    return res.status(200).json({ message: 'Conversation created', conversation, newMessage });
  }

  // Meaning this is an existing conversation------------------------------
  else
  {
    // Update the last message
    const conversation = await Conversation.findByIdAndUpdate(conversationInfo._id, {lastMessage : message});
    // Create a new message
    const newMessage = await Message.create({...message, conversationId : conversation._id, readBy : [userId]});
    conversation.lastMessage.messageId = newMessage._id;
    conversation.lastMessage.timestamp = newMessage.createdAt;
    await conversation.save();
    return res.status(200).json({ message: 'Message sent', conversation, newMessage });
  }
  

}

module.exports.getConversationList = async (req, res) => {
  const userId = req.user._id;

  if(!userId)
  {
    return res.status(400).json({ message: "User not found"});
  }

  const conversations = await Conversation.find({
    $and: [
      { participants: { $elemMatch: { userId: userId } } },
    ],
    isGroup: false
  }).populate('lastMessage.messageId', 'content createdAt readBy senderId')
  .populate('participants.userId', '_id firstname lastname profileImage')
  .sort({ 'lastMessage.timestamp': -1 })
  
  // get the user information
  const user = await User.findOne({_id: userId, isDeactivated : false, email_verified : true, 'account_status.status' : 'Active'}).select('_id firstname lastname profileImage');
  if(!user)
  {
      return res.status(400).json({ message: "User not found"});
  }

  // console.log(conversations);
  return res.status(200).json({conversations, user });
}

module.exports.readConversation = async (req, res) => {
  const userId = req.user._id;
  const _id = req.body._id;
  const option = req.body.option;
  const conversationID = req.body.conversationID;
  const isGroup = option == 'g';

  // If there is a valid parameters
  if(_id != 'undefined' && option != 'undefined')
  {
    const isUserFriend = await Friendship.countDocuments({
      participants: { $all: [userId, _id] },
      status: 'accepted'
    }).limit(1)
    if(isUserFriend)
    {
      
      if(conversationID)
      {
        const messages = await Message.find({$and: [{conversationId : conversationID}, {readBy : {$ne : userId}}]}).sort({createdAt : 1})
        if(messages.length > 0)
        {
            messages.forEach((message) => {
            message.readBy.push(userId)
            message.save()
          })

          return res.status(200).json({ message: 'Message read' });
        }
      }
    }
    
  }

}
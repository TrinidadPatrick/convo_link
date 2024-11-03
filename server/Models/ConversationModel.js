// models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    headId: {type : String, required : true},
    participants: [
      {
        _id: false,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to Users collection
        joinedAt: { type: Date, default: Date.now } // Default to current date
      }
    ],
    createdAt: { type: Date, default: Date.now }, // Default to current date
    updatedAt: { type: Date, default: Date.now }, // Default to current date
    lastMessage: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // Reference to Messages collection
      timestamp: { type: Date, default: Date.now() } // This can be optional or have a default
    },
    isGroup: { type: Boolean, default: false } // Default to false
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;

// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }, // Reference to Conversations collection
    headId: {type : String, required : true},
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to Users collection
    content: { type: String, required: true }, // Message content
    createdAt: { type: Date, default: Date.now }, // Default to current date
    updatedAt: { type: Date, default: Date.now }, // Default to current date
    messageType: { type: String, enum: ['text', 'image', 'video', 'audio', 'file'], required: true }, // Message type
    isRead: { type: Boolean, default: false } // Indicates if the message has been read
  },
);

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;

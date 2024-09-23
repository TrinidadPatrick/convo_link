// models/Friendship.js
const mongoose = require('mongoose');

const ConnectedUsersSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  socket_id: {type : String, required : true},
  createdAt: { type: Date, default: Date.now }
});

const ConnectedUsers = mongoose.model('ConnectedUsers', ConnectedUsersSchema);
module.exports = ConnectedUsers;

const {Server, Socket} = require('socket.io');
const User = require("./Models/userModel");
const ConnectedUsers = require("./Models/ConnectedUsersModel");
const { get } = require('http');

module.exports = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3000', 'https://convo-wave.vercel.app', 'http://192.168.100.5:5000/api', 'http://192.168.100.5:3000', 
            'http://192.168.100.10:5000/api', 'http://192.168.100.10:3000'],
            methods: ['GET', 'POST'],
        },
    })

    let onlineUsers = [];

const addUserToConnectedUsers = (user_id, socket_id) => {
    !onlineUsers.some((user) => user.socket_id === socket_id) && 
    onlineUsers.push({ user_id, socket_id });
}

const removeUser = (socket_id) => {
    const userIndex = onlineUsers.findIndex((user) => user.socket_id === socket_id);
    if (userIndex !== -1) {
        onlineUsers.splice(userIndex, 1);
    }
}

const getOnlineUsers = () => {
    return onlineUsers;
}


    io.on('connection', (socket) => {
        // Sets the status of the user
        socket.on('setProfileStatus', async (data) => {
           const user = await User.findById(data._id);
           if(user)
           {
            await User.findByIdAndUpdate(user._id, {profile_status : data.status});
           }
        });

        // Add user to connected users
        socket.on('addUserToConnectedUsers', (data) => {
            addUserToConnectedUsers(data.user_id, socket.id);
            io.emit('onlineUsers', onlineUsers);
        });

        // Notification
        socket.on('message_notification_send', (data) => {
            const receivers = onlineUsers.filter((user) => user.user_id == data.receiver);
            if(receivers)
            {
                receivers.forEach((receiver) => {
                    io.to(receiver.socket_id).emit('message_notification', data.type);
                });
            }
        });

        socket.on('disconnect', async () => {
            removeUser(socket.id);
            io.emit('onlineUsers', onlineUsers);
        });
        
        socket.on('start-call', (data) => {
           const receiver = onlineUsers.find((user) => user.user_id === data.to);
           console.log(data.to)
            io.to(receiver.socket_id).emit('incoming-call', {
              from: socket.id,
              signal: data.signal
            });
        });
        
        socket.on('accept-call', (data) => {
            // const receiver = onlineUsers.find((user) => user.user_id === data.to);
            console.log(data.to)
            io.to(data.to).emit('call-accepted', data.signal);
        });
        
        socket.on('end-call', (data) => {
            io.to(data.to).emit('call-ended');
        });
    });

    return io;
}

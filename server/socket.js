const {Server, Socket} = require('socket.io');
const User = require("./Models/userModel");
const ConnectedUsers = require("./Models/ConnectedUsersModel");
const { get } = require('http');

module.exports = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3000', 'https://convo-wave.vercel.app', 'http://192.168.100.5:5000/api', 'http://192.168.100.5:3000'],
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
        socket.on('notification_send', (data) => {
            const receiver = onlineUsers.find((user) => user.user_id == data.receiver);
            if(receiver)
            {
                io.to(receiver.socket_id).emit('notification_receive', data.type);
            }
            
        });

        socket.on('disconnect', async () => {
            removeUser(socket.id);
            io.emit('onlineUsers', onlineUsers);
        });

        // socket.on("call-user", (data) => {
        //     const receiver = onlineUsers.find((user) => user.user_id === data.userToCall);
        //     if (receiver) {
        //         io.to(receiver.socket_id).emit("call-incoming", {
        //             signal: data.signalData,
        //             from: data.from,
        //         });
        //     } else {
        //         console.log(`User ${data.userToCall} not found in online users.`);
        //     }
        // });
        
        socket.on('start-call', (data) => {
            
           const receiver = onlineUsers.find((user) => user.user_id === data.to);
           console.log(receiver)
            io.to(receiver.socket_id).emit('incoming-call', {
              from: socket.id,
              signal: data.signal
            });
          });
        
          socket.on('accept-call', (data) => {
            io.to(data.to).emit('call-accepted', data.signal);
          });
        
          socket.on('end-call', (data) => {
            io.to(data.to).emit('call-ended');
          });
    });

    return io;
}

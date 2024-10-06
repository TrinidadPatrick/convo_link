const {Server, Socket} = require('socket.io');
const User = require("./Models/userModel");
const ConnectedUsers = require("./Models/ConnectedUsersModel");

module.exports = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3000', 'https://convo-wave.vercel.app'],
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

        socket.on('disconnect', async () => {
            removeUser(socket.id);
            io.emit('onlineUsers', onlineUsers);
        });
    });

    return io;
}
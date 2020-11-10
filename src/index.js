const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersinRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('recieveMessage', generateMessage("Welcome!", "Chat bot"));
        socket.broadcast.to(user.room).emit('recieveMessage', generateMessage(`${user.username} has joined the chat`, "Chat bot"));
        io.to(user.room).emit('roomUpdate', getUsersinRoom(user.room));

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        filter.addWords("test");
        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed");
        }
        io.to(user.room).emit('recieveMessage', generateMessage(message, user.username));
        callback();
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('recieveLocation', generateLocationMessage(location, user.username));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('recieveMessage', generateMessage(`${user.username} has left the chat`, "Chat bot"));
        }
    });

});


server.listen(port, () => {
    console.log("Server running on port " + port);
});
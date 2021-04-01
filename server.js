const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000 

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
    console.log("new Websocket initiated"); 

    socket.on('joinRoom', function({username, room}){
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        socket.emit('message', formatMessage('Admin', 'Welcome to ChatCord'));
        socket.broadcast.to(user.room).emit('message',formatMessage('Admin',`${user.username} has joined the chat`));    

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('disconnect', function(){
        const user = userLeave(socket.id);
        console.log(user);

        if(user){
            io.to(user.room).emit('message', formatMessage('Admin', `${user.username} has disconnected`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })   
        }
    });

    socket.on('chatMessage', function(msg){
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

})


server.listen(PORT, function(){
    console.log("server started");
})
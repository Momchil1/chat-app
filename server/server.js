const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public'); // the result will be /public and not server/../public
const port = process.env.PORT || 3000;
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

// web sockets create a persistent 2-way connection between server and browser(tab) until some of them are shut down

var app = express();
var server = http.createServer(app); // express() uses http.createServer behind the scenes, but we need to use it manually in order to use later socket.io
var io = socketIO(server); // in io we get the web socket server
var users = new Users();

app.use(express.static(publicPath));
// we register an event listener. We listen for a specific event and do something when this event happens
// these are build-in events
io.on('connection', (socket) => { // we have access to the socket argument
    console.log('New user connected!');

    // we emit new event for which the client is listening (socket.on('newMessage'));
    // we can also emit an event with data which will be sent to the client
    // socket.emit('newMessage', {
    //     from: 'John',
    //     text: 'Hello',
    //     createdAt: 123123
    // });

    // listen for custom event from client
    socket.on('createMessage', function (message, callback) { // callback argument is optional
        var user = users.getUser(socket.id);
        if (user && isRealString(message.text)){
            // io.emit emits an event to every connection, while socket.emit emits an event only to a single connection
            // when a message is received (message in the above callback) we emit this message to everyone form the server
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }

        // with broadcast we are emitting events for everyone except for this socket(myself)
        // socket.broadcast.emit('newMessage', {
        //     from: message.from,
        //     text: message.text,
        //     createdAt: new Date().getTime()
        // });

        // we call the callback so the client understands that the server has received the message sent by client
        callback('Acknowledged from server');
    });
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if (user){
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)){
            return callback('Name and room are required.')
        }
        // build-in method join()
        socket.join(params.room);
        // we remove user if he has previously joined this room and then we join him
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
        // "to" is used to indicate to which room we want to join
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
        callback();
    });

    socket.on('disconnect', () => { // when disconnected
        // when user leaves the room we remove him from the users array and update the list preview
        var user = users.removeUser(socket.id);
        if (user){
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    })
});



// instead of using app.listen, we use server.listen
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
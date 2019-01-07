const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public'); // the result will be /public and not server/../public
const port = process.env.PORT || 3000;

// web sockets create a persistent 2-way connection between server and browser(tab) until some of them are shut down

var app = express();
var server = http.createServer(app); // express() uses http.createServer behind the scenes, but we need to use it manually in order to use later socket.io
var io = socketIO(server); // in io we get the web socket server

app.use(express.static(publicPath));
// we register an event listener. We listen for a specific and do something when this event happens
io.on('connection', (socket) => { // we have access to the socket argument
    console.log('New user connected!');

    socket.on('disconnect', () => { // when disconnected
        console.log('User was disconnected');
    })
});

// instead of using app.listen, we use server.listen
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
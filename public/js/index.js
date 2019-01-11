// io() is method available to us from the socket.io library. When we call it, we initiate a request from the client
// to the server to open up a web socket and keep that connection open. Socket variable is critical to
// communicating between client and server. It's needed to listen for data from the server and to send data from
// client to the server
var socket = io();

// the on event is the same as the on event on the server. In this case we don't have access to the
// socket argument since we have it already above
socket.on('connect', function(){ // when there is a connection
    console.log('Connected to server');

    // we emit event here in the connect's callback, because we do not want to emit an event before we are connected
    // socket.emit('createMessage', {
    //     from: 'Mom',
    //     text: 'Hey this is Mom'
    // })
});

socket.on('disconnect', function(){ // when disconnected
    console.log('Disconnected from server');
});
// listen for custom event
socket.on('newMessage', function(message){ // the passed data from server comes like an argument in the callback function
    console.log(message);
    var li = $('<li></li>');
    li.text(`${message.from}: ${message.text}`);
    $('#messages').append(li);
});
// we can add a callback function to acknowledge that the server has received the message. On server the callback
// will be called
// socket.emit('createMessage', {
//     from: 'Mom',
//     text: 'Hey this is Mom'
// }, function (data) {
//    console.log(data);
// });

$('#message-form').on('submit', function (e) {
    e.preventDefault();
    socket.emit('createMessage', {
        from: 'User',
        text: $('[name=message]').val()
    }, function (data) {
        console.log(data);
    });
});
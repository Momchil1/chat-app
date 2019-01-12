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
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var li = $('<li></li>');
    li.text(`${message.from} ${formattedTime}: ${message.text}`);
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
    }, function (data) { // this is the function where the acknowledged data comes from server
        console.log(data);
        $('[name=message]').val('') // since we acknowledged that the server has received the data, we clear the input
    });
});

// The HTML Geolocation API is used to get the geographical position of a user

var locationButton = $('#send-location');
locationButton.on('click', function () {
   if (!navigator.geolocation){
       return alert('Geolocation not supported by your browser.')
   }
    $('#send-location').attr('disabled', 'disabled');
   navigator.geolocation.getCurrentPosition(function (position) {
       $('#send-location').removeAttr('disabled');
       socket.emit('createLocationMessage', {
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
       })
   }, function () {
       $('#send-location').removeAttr('disabled');
       alert('Unable to fetch location.')
   })
});

socket.on('newLocationMessage', function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var li = $('<li></li>');
    var a = $('<a target="_blank">My current location</a>');
    li.text(`${message.from} ${formattedTime}:`);
    a.attr('href', message.url);
    li.append(a);
    $('#messages').append(li);
});

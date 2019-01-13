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
    var params = $.deparam(window.location.search); // makes object from query string
    socket.emit('join', params, function (err){
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log(params.name);
        }
    })
});

socket.on('disconnect', function(){ // when disconnected
    console.log('Disconnected from server');
});
// listen for custom event
socket.on('newMessage', function(message){ // the passed data from server comes like an argument in the callback function
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
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
    var template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});
// append users to the sidebar
socket.on('updateUserList', function(users){
    var ol = $('<ol></ol>');

    users.forEach(function (user) {
        ol.append($('<li></li>').text(user));
    });

    $('#users').html(ol);
});

function scrollToBottom () {
    // Selectors
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child')
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

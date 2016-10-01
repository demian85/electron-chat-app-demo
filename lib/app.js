const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

exports.app = {
  run : function (port) {
    server.listen(port, function () {
      console.log('Server listening at port %d', port);
    });
  }
};

io.on('connection', function onConnection(socket) {
  let username;
  let numUsers = 0;

  socket.on('message', function onMessage(data) {
    const text = data.text;
    io.sockets.emit('message', { username, text });
  });

  socket.on('login', function (data) {
    username = data.username;
    numUsers += 1;
    io.sockets.emit('login', {
      username: username,
      numUsers: numUsers
    });
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', { username });
  });

  socket.on('stop-typing', function () {
    socket.broadcast.emit('stop-typing', { username });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    numUsers -= 1;
    socket.broadcast.emit('user-left', { username, numUsers });
  });
});

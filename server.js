const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');

const PORT = 3000;

const messageModel = require('./model/Messages');

app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));

let sockets = [];
const obj = {};

io.on('connection', async (socket) => {
  io.emit('userList', sockets);

  const allMessages = await messageModel.getAll();
  io.emit('history', allMessages);

  const dispatch = (nickname) => {
    if (!obj.user || !obj.user.includes(nickname)) {
      obj.user = nickname;
      sockets.unshift(obj.user);
      sockets = sockets.filter((este, i) => sockets.indexOf(este) === i);

      io.emit('userList', sockets);
    }
  };

  socket.on('newNick', async ({ nickname }) => {
    await dispatch(nickname);
  });

  socket.on('message', async ({ nickname, chatMessage }) => {
    await dispatch(nickname);

    const message = await messageModel.changeValues(nickname, chatMessage);

    io.emit('message', `${message.date} ${message.nickname}: ${message.message}`);
  });

  socket.on('disconnect', () => {
    sockets.splice(obj.user);
    io.emit('userList', sockets);
  });
});
http.listen(PORT, () => {
  console.log(`Escutando a porta ${PORT}`);
});

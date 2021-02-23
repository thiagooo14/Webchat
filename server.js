const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const moment = require('moment');
const cors = require('cors');
const { createMessage, getAllMessages } = require('./model/Messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

// app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'public'));
app.use(cors());

app.use('/', express.static(path.join(__dirname, 'public')));

io.on('connection', async (socket) => {
  const messagesHistoric = await getAllMessages();

  messagesHistoric.forEach(({ chatMessage, nickname, timestamp }) => {
    const fullMessage = `${timestamp} - ${nickname}: ${chatMessage}`;
    socket.emit('history', fullMessage);
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    const time = new Date();
    const timestamp = moment(time).format('DD-MM-yyyy HH:mm:ss');
    await createMessage(chatMessage, nickname, timestamp);
    const fullMessage = `${timestamp} - ${nickname}: ${chatMessage}`;

    io.emit('message', fullMessage);
  });

  socket.on('changeNickname', ({ newNickname }) => {
    io.emit('changeNickname', newNickname);
  });

  let usersList = [];

  socket.on('logged-users', ({ nickname }) => {
    usersList.push({ socketId: socket.id, nickname });
    io.emit('online-users', usersList);
  });

  socket.on('changeNickname', ({ newNickname }) => {
    usersList.filter(({ nickname }) => nickname !== newNickname);
    usersList.push({ socketId: socket.id, nickname: newNickname });
    io.emit('online-users', usersList);
  });

  socket.on('disconnect', () => {
    usersList.filter(({ socketId }) => socketId !== socket.id);
    usersList = [];
    io.emit('online-users', usersList);
  });
});

server.listen(PORT, () => {
  console.log(`Lintening on ${PORT}`);
});

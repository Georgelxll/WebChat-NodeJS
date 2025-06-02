const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const users = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('new user', (username) => {
    users[socket.id] = username;
    console.log(`${username} entrou no chat.`);
  });

  socket.on('chat message', (msg) => {
    const name = users[socket.id] || 'Desconhecido';
    io.emit('chat message', { name, message: msg });
  });

  socket.on('disconnect', () => {
    console.log(`${users[socket.id] || 'Usuário'} saiu`);
    delete users[socket.id];
  });
});

http.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

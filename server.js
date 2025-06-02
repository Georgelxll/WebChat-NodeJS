const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const users = {};
const typingUsers = new Set();


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('new user', (username) => {
    users[socket.id] = username;
    console.log(`${username} entrou no chat.`);
  });

  socket.on('chat message', ({ message, reply }) => {
    const name = users[socket.id] || 'Desconhecido';
    io.emit('chat message', {
      name,
      message,
      reply: reply || null
    });
  });

  socket.on('new user', (username) => {
    users[socket.id] = username;
    console.log(`${username} entrou no chat.`);

    // Envia a lista atualizada para todos os clientes
    io.emit('update users', Object.values(users));
  });

  socket.on('disconnect', () => {
    console.log(`${users[socket.id] || 'Usuário'} saiu`);
    delete users[socket.id];

    // Atualiza a lista para todos os clientes
    io.emit('update users', Object.values(users));
  });

  // Quando o usuário começa a digitar
  socket.on('typing', (username) => {
    typingUsers.add(username);
    io.emit('users typing', Array.from(typingUsers));
  });

  // Quando o usuário para de digitar
  socket.on('stop typing', (username) => {
    typingUsers.delete(username);
    io.emit('users typing', Array.from(typingUsers));
  });

  socket.on('image', ({ name, image }) => {
    io.emit('image', { name, image });
  });

});


http.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

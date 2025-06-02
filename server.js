const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  console.log('Usuário conectado:', socket.id);

  socket.on('chat message', msg => {
    io.emit('chat message', msg); // envia para todos
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

    const socket = io();
    const username = localStorage.getItem('username');
    // Solicita permissão para notificações
    if (Notification.permission !== 'granted') {
    Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
        console.log('Usuário negou notificações');
        }
    });
    }


    const chatBox = document.getElementById('chatBox');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');

    const emojiBtn = document.getElementById('emojiBtn');
    const emojiMenu = document.getElementById('emojiMenu');

    // Alterna exibição do menu de emojis
    emojiBtn.addEventListener('click', () => {
        emojiMenu.classList.toggle('hidden');
    });

    // Insere emoji ao clicar
    emojiMenu.querySelectorAll('span').forEach((span) => {
    span.addEventListener('click', () => {
        messageInput.value += span.textContent;
        messageInput.focus();
    });
    });

    // Fecha o menu se clicar fora
    document.addEventListener('click', (e) => {
    if (
        !emojiMenu.contains(e.target) &&
        e.target !== emojiBtn &&
        e.target !== messageInput
    ) {
        emojiMenu.classList.add('hidden');
    }
    });


    // Envia nome para o servidor ao conectar
    socket.emit('new user', username);

    // Envia mensagem
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (messageInput.value.trim()) {
            socket.emit('chat message', {
            name: username,
            message: messageInput.value,
            reply: replyToMessage
            });
            messageInput.value = '';
            replyToMessage = null;
            replyBox.classList.add('hidden');
        }
    });

    let replyToMessage = null;

    const replyBox = document.getElementById('replyBox');
    const replyText = document.getElementById('replyText');
    const cancelReply = document.getElementById('cancelReply');

    socket.on('chat message', ({ name, message, reply }) => {
        const msg = document.createElement('div');
        msg.classList.add('message');

        // Quando clicar na mensagem, ativar a citação
        msg.addEventListener('click', () => {
            replyToMessage = { name, message };

            // Limita o texto a 30 caracteres com reticências
            const preview = message.length > 30 ? message.substring(0, 30) + '...' : message;

            replyText.textContent = `${name}: ${preview}`;
            replyBox.classList.remove('hidden');
        });

        if (reply) {
            const replyDiv = document.createElement('div');
            replyDiv.style.fontSize = '0.8em';
            replyDiv.style.color = 'gray';
            replyDiv.style.borderLeft = '2px solid #ccc';
            replyDiv.style.paddingLeft = '5px';
            replyDiv.style.width = '200px';
            replyDiv.style.wordWrap = 'break-word';
            replyDiv.style.whiteSpace = 'pre-wrap';
            replyDiv.style.backgroundColor = '#f1f1f1';
            replyDiv.style.borderRadius = '5px';
            replyDiv.style.marginBottom = '4px';

            // Limita a mensagem a 30 caracteres
            let preview = reply.message;
            if (preview.length > 30) {
            preview = preview.slice(0, 30) + '...';
            }

            replyDiv.innerHTML = `<strong>${reply.name}:</strong> ${preview}`;
            msg.appendChild(replyDiv);
        }

        const msgText = document.createElement('div');
        msgText.innerHTML = `<strong>${name}:</strong> ${message}`;
        msgText.style.wordWrap = 'break-word';
        msgText.style.whiteSpace = 'pre-wrap';
        msgText.style.maxWidth = '100%';
        msg.appendChild(msgText);

        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });


    messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (messageInput.value.trim()) {
        socket.emit('chat message', {
        message: messageInput.value,
        reply: replyToMessage
        });
        messageInput.value = '';
        replyToMessage = null;
        replyBox.classList.add('hidden');
    }
    });

    cancelReply.addEventListener('click', () => {
    replyToMessage = null;
    replyBox.classList.add('hidden');
    });



    const userList = document.getElementById('userList');

    // Atualiza a lista de usuários online
    socket.on('update users', (users) => {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
    });



  const h1 = document.querySelector('h1');
  const fullText = 'Aga Promessas vazias';
  const middleText = 'Aga Pro';
  const finalText = 'Aga Pro 😎';
  let index = 0;

  // Etapa 1: Digitar fullText
  function typeFullText() {
    if (index <= fullText.length) {
      h1.textContent = fullText.slice(0, index);
      index++;
      setTimeout(typeFullText, 100);
    } else {
      setTimeout(deleteToMiddleText, 1000); // Espera antes de apagar
    }
  }

  // Etapa 2: Apagar até middleText
  function deleteToMiddleText() {
    if (h1.textContent.length > middleText.length) {
      h1.textContent = h1.textContent.slice(0, -1);
      setTimeout(deleteToMiddleText, 100);
    } else {
      setTimeout(addFinalText, 500); // Pequena pausa antes de mostrar emoji
    }
  }

  // Etapa 3: Adicionar o emoji ao final
  function addFinalText() {
    h1.textContent = finalText;
  }

  window.addEventListener('load', () => {
    h1.textContent = '';
    typeFullText();
  });

    const typingStatus = document.getElementById('typingStatus');
    let typingTimeout;

    // Notifica que o usuário está digitando
    messageInput.addEventListener('input', () => {
    socket.emit('typing', username);

    // Reseta o timeout toda vez que o usuário digita
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop typing', username);
    }, 1000); // 1 segundo sem digitar = parou
    });

    // Recebe quem está digitando
    let currentlyTyping = [];

    socket.on('users typing', (typingUsers) => {
    currentlyTyping = typingUsers.filter(name => name !== username); // Exclui o próprio nome
    if (currentlyTyping.length === 0) {
        typingStatus.textContent = '';
    } else {
        const displayNames = currentlyTyping.slice(0, 3).join(', ');
        typingStatus.textContent = `${displayNames} está${currentlyTyping.length > 1 ? 'o' : ''} digitando...`;
    }
    });


    const pasteCatcher = document.getElementById('pasteCatcher');

    // Quando uma imagem é colada
    window.addEventListener('paste', (event) => {
    if (event.clipboardData) {
        const items = event.clipboardData.items;
        for (let item of items) {
        if (item.type.indexOf("image") === 0) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function (evt) {
            const base64Image = evt.target.result;
            socket.emit('image', { name: username, image: base64Image });
            };
            reader.readAsDataURL(file);
        }
        }
    }
    });

    // Suporte a arrastar e soltar imagem
    chatBox.addEventListener('dragover', (e) => e.preventDefault());

    chatBox.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (evt) {
        const base64Image = evt.target.result;
        socket.emit('image', { name: username, image: base64Image });
        };
        reader.readAsDataURL(file);
    }
    });

    // Exibe imagem no chat
    socket.on('image', ({ name, image }) => {
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${name}:</strong><br><img src="${image}" style="max-width: 200px; border-radius: 8px;" />`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (name !== username && Notification.permission === 'granted' && document.hidden) {
        new Notification(`${name} enviou uma imagem`);
    }
    });

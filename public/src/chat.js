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
        socket.emit('chat message', messageInput.value);
        messageInput.value = '';
      }
    });

    socket.on('chat message', ({ name, message }) => {
    const msg = document.createElement('div');
    msg.textContent = `${name}: ${message}`;
    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;

    const audio = new Audio('notify.mp3');
    
    // Exibe notificação se não for o próprio usuário e a aba estiver em segundo plano
    if (name !== username && Notification.permission === 'granted' && document.hidden) {
        new Notification(`${name} diz:`, {
        body: message,
        });
        audio.play();
    }
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
  const fullText = 'HPromessas';
  const middleText = 'HPro';
  const finalText = 'HPro 😎';
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

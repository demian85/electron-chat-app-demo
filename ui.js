/* eslint-env browser, node */

let socket;
let username;

window.onload = init;

function init() {
  // socket
  socket = io.connect('http://localhost:' + (process.env.PORT || 3010));
  socket.on('message', (data) => {
    appendText(`${data.username}: ${data.text}`);
  });
  socket.on('login', (data) => {
    appendText(`${data.username} has logged in.`);
    updateUserList(data.users);
  });
  socket.on('typing', (data) => {
    setStatus(`${data.username} is typing...`);
  });
  socket.on('stop-typing', () => {
    setStatus('');
  });
  socket.on('logout', (data) => {
    appendText(`${data.username} disconnected.`);
    updateUserList(data.users);
  });

  // events
  document.querySelector('#text-input').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      sendText();
    }
  });
  document.querySelector('#username').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      const value = this.value.trim();
      if (value) {
        username = this.value;
        login();
      }
    }
  });
  document.querySelector('#send-btn').addEventListener('click', sendText);
}

function sendText() {
  const inputField = document.querySelector('#text-input');
  const text = inputField.value.trim();
  if (!text) return;
  socket.emit('message', { username, text });
  inputField.value = '';
}

function appendText(text) {
  document.querySelector('#chat-text').textContent += `${escapeHtml(text)}\n`;
}

function escapeHtml(text) {
  return text.replace('<', '&lt;').replace('>', '&gt;');
}

function setStatus(text) {
  const node = document.querySelector('#chat-status-msg');
  if (text) {
    node.textContent = text;
    node.classList.remove('hidden');
  } else {
    node.classList.add('hidden');
  }
}

function updateUserList(users) {
  document.querySelector('#users').innerHTML = Array.from(users).map(name => `<li>${name}</li>`).join('');
}

function login() {
  socket.emit('login', { username });
  document.querySelector('#login-box').classList.add('hidden');
}

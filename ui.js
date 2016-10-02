/* eslint-env browser, node */

let socket;
let username;

window.onload = function () {
  initSocket();
  initEvents();
};

function $(sel) {
  return document.querySelector(sel);
}

function initSocket() {
  const server = $('#server-url').value.trim();
  socket = io.connect(server);
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
}

function initEvents() {
  let typingTimer;
  let typing = false;

  $('#text-input').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      sendText();
    }
  });
  $('#text-input').addEventListener('input', function () {
    if (!typing) {
      typing = true;
      socket.emit('typing', { username });
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingTimer = setTimeout(function () {
      typing = false;
      socket.emit('stop-typing', { username });
    }, 1000);
  });
  $('#username').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      const value = this.value.trim();
      if (value) {
        username = this.value;
        login();
      }
    }
  });
  $('#send-btn').addEventListener('click', sendText);
  $('#username').focus();
}

function sendText() {
  const inputField = $('#text-input');
  const text = inputField.value.trim();
  if (!text) return;
  socket.emit('message', { username, text });
  inputField.value = '';
}

function appendText(text) {
  $('#chat-text').textContent += `${escapeHtml(text)}\n`;
}

function escapeHtml(text) {
  return text.replace('<', '&lt;').replace('>', '&gt;');
}

function setStatus(text) {
  const node = $('#chat-status-msg');
  if (text) {
    node.textContent = text;
    node.classList.remove('hidden');
  } else {
    node.classList.add('hidden');
  }
}

function updateUserList(users) {
  $('#users').innerHTML = Array.from(users).map(name => `<li>${name}</li>`).join('');
}

function login() {
  socket.emit('login', { username });
  $('#login-box').classList.add('hidden');
}

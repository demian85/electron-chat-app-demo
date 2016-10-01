/* eslint-env browser, node */

let socket;
let username = 'demian';

window.onload = init;

function init() {
  // socket
  socket = io.connect('http://localhost:' + (process.env.PORT || 3010));
  socket.emit('login', { username });
  socket.on('message', (data) => {
    document.querySelector('#chat').textContent += `${data.username}: ${escapeHtml(data.text)}\n`;
  });
  socket.on('login', (data) => {
    document.querySelector('#chat').textContent += `${data.username} has logged in. ${data.numUsers} users online.\n`;
  });

  // events
  document.querySelector('#text-input').addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      sendText();
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

function escapeHtml(text) {
  return text.replace('<', '&lt;').replace('>', '&gt;');
}

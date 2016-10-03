/* eslint-env browser, node */
/* global React */

const marked = require('marked');

let typing = false;
let typingTimer;

document.addEventListener('DOMContentLoaded', function onLoad() {
  const app = React.createElement(App);
  ReactDOM.render(app, document.body);
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      url: '',
      users: [],
      messages: [],
      status: '',
    };
    this.onLogin = this.onLogin.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSend = this.onSend.bind(this);
  }
  initSocket(url) {
    this.setState({status: 'Connecting...'});
    const socket = io.connect(url);
    socket.on('connect', () => {
      this.appendMessage(`Connected to server ${this.state.url}`);
      this.setState({status: ''});
    });
    socket.on('message', (data) => {
      this.appendMessage(`__${data.username}:__ ${data.text}`);
    });
    socket.on('login', (data) => {
      this.appendMessage(`${data.username} has logged in.`);
      this.setState({users: data.users});
    });
    socket.on('typing', (data) => {
      this.setState({status: `${data.username} is typing...`});
    });
    socket.on('stop-typing', () => {
      this.setState({status: ''});
    });
    socket.on('logout', (data) => {
      this.appendMessage(`${data.username} disconnected.`);
      this.setState({users: data.users});
    });
    this.socket = socket;
  }
  appendMessage(message) {
    this.setState((prev, props) => {
      const messages = prev.messages;
      messages.push(message);
      return { messages };
    });
  }
  onLogin(url, username) {
    this.setState({url, username});
    this.initSocket(url);
    this.socket.emit('login', { username });
    this.refs.inputBar.focus();
  }
  onInput(text) {
    const username = this.state.username;
    if (!typing) {
      typing = true;
      this.socket.emit('typing', { username });
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingTimer = setTimeout(() => {
      typing = false;
      this.socket.emit('stop-typing', { username });
    }, 1000);
  }
  onSend(text) {
    const username = this.state.username;
    this.socket.emit('message', { username, text });
  }
  componentDidMount() {
    this.refs.loginBox.focus();
  }
  render() {
    return (
      <main>
        <LoginBox ref="loginBox" url="http://localhost:3010" onLogin={this.onLogin} />
        <div className="content">
          <UserList users={this.state.users} />
          <ChatArea messages={this.state.messages} status={this.state.status} />
        </div>
        <InputBar ref="inputBar" onInput={this.onInput} onSend={this.onSend} />
      </main>
    );
  }
}

class LoginBox extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }
  focus() {
    this.refs.username.focus();
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      const value = this.refs.username.value.trim();
      const url = this.refs.url.value.trim();
      if (value) {
        this.props.onLogin(url, value);
        this.refs.root.classList.add('hidden');
      }
    }
  }
  render() {
    return (
      <div id="login-box" ref="root">
        <div>
          <h2>Login</h2>
          <input type="url" id="server-url" ref="url" value={this.props.url} />
          <input type="text" placeholder="enter username" id="username" ref="username" onKeyDown={this.onKeyDown} autofocus />
        </div>
      </div>
    );
  }
}

class UserList extends React.Component {
  render() {
    const opts = { sanitize: true };
    const users = this.props.users.map(user => <li dangerouslySetInnerHTML={{__html: marked(user, opts)}}></li>)
    return (
      <aside>
        <h3>Connected Users</h3>
        <ul id="users">{users}</ul>
        <div id="user-stats">{users.length} users online.</div>
      </aside>
    );
  }
}

class ChatArea extends React.Component {
  render() {
    const opts = { sanitize: true };
    const text = this.props.messages.map(msg => `${marked(msg, opts)}\n`).join('');
    return (
      <div id="chat">
        <div id="chat-text" dangerouslySetInnerHTML={{__html: text}}></div>
        <div id="chat-status-msg">{this.props.status}</div>
      </div>
    );
  }
}

class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      this.send();
    }
  }
  onInput() {
    const value = this.refs.input.value.trim();
    this.props.onInput(value);
  }
  onClick() {
    this.send();
  }
  send() {
    const value = this.refs.input.value.trim();
    if (value) {
      this.props.onSend(value);
      this.refs.input.value = ''; // Should I mutate state instead?
    }
  }
  focus() {
    this.refs.input.focus();
  }
  render() {
    return (
      <div className="input">
        <input
          type="text"
          id="text-input"
          ref="input"
          placeholder="say something..."
          onInput={this.onInput}
          onKeyDown={this.onKeyDown}
        />
        <button id="send-btn" onClick={this.onClick}>Send</button>
      </div>
    );
  }
}

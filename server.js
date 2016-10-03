const server = require('./lib/server').server;

const port = process.env.PORT || 3010;

server.run(port);

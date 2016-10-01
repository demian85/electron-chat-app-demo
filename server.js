const app = require('./lib/app').app;

const port = process.env.PORT || 3010;

app.run(port);

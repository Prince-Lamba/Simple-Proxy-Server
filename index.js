const express = require('express');

const rateLimiter = require('./components/rate-limiter');
const getCached = require('./components/cache');

const app = express();
const PORT = 3000;

app.use(rateLimiter);
app.use(getCached);

app.listen(PORT, () => {
  console.log('Proxy server is listening on port : ' + PORT);
});

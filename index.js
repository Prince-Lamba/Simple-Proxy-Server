const express = require('express');
const http = require('http');

require('dotenv').config();
const rateLimiter = require('./components/rate-limiter');

const app = express();
const PORT = 3000;

const TARGET_HOST = process.env.TARGET_HOST;
const TARGET_PORT = process.env.TARGET_PORT;

app.use(rateLimiter);

app.use((req, res) => {
  const params = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: req.method,
    path: req.path,
    headers: req.headers,
  };

  let responseData = '';

  const proxyReq = http.request(params, (proxyRes) => {
    proxyRes.on('data', (chunk) => {
      responseData += chunk;
    });

    proxyRes.on('end', () => {
      res.json({ data: responseData });
    });
  });

  proxyReq.on('error', (err) => {
    console.log('Proxy request error : ', err);
  });

  proxyReq.end();
});

app.listen(PORT, () => {
  console.log('Proxy server is listening on port : ' + PORT);
});

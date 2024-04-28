const http = require('http');
require('dotenv').config();

// Environment Variables (Target Server)
const TARGET_HOST = process.env.TARGET_HOST;
const TARGET_PORT = parseInt(process.env.TARGET_PORT, 10);

const fetchFormServer = async (req, res) => {
  // Set request parameters
  const params = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: req.method,
    path: req.path,
    headers: req.headers,
  };

  let responseData = '';

  // send a promise to the cache.js file
  return new Promise((resolve, reject) => {
    // create a new request using defined parameters
    const proxyReq = http.request(params, (proxyRes) => {
      // store data from the server
      proxyRes.on('data', (chunk) => {
        responseData += chunk;
      });

      // function called when request ends
      proxyRes.on('end', () => {
        const response = {
          contentType: proxyRes.headers['content-type'],
          data: responseData,
        };

        // resiolve the promise with the data from server
        resolve(response);
      });
    });

    proxyReq.on('error', (err) => {
      console.log('Proxy request error : ', err);
    });

    proxyReq.end();
  });
};

module.exports = fetchFormServer;

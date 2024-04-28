const fetchFromServer = require('./fetch-from-server');
const http = require('http');
const url = require('url');
require('dotenv').config();

// Environment Variables (Cache)
const cacheExpiryTime = parseInt(process.env.CACHE_EXPIRY, 10) * 1000;
const cleanUpTime = parseInt(process.env.CLEAN_UP_TIME, 10) * 1000;

// Object to store data as cache
const cacheMap = {};

const cache = async (req, res) => {
  // exclude multiple request within single request (express specific)
  if (req.path === '/favicon.ico') {
    return;
  }

  const requestUrl = url.parse(req.url);
  const cacheKey = requestUrl.href;

  if (cacheMap[cacheKey]) {
    const cachedResponse = cacheMap[cacheKey];
    cachedResponse.lastReqTime = Date.now();

    res.writeHead(200, { 'content-type': cachedResponse.contentType });
    res.end(cachedResponse.data);

    console.log('cached response');
  } else {
    const responseFromServer = await fetchFromServer(req, res);

    cacheMap[cacheKey] = {
      contentType: responseFromServer.contentType,
      data: responseFromServer.data,
      lastReqTime: Date.now(),
    };
    res.writeHead(200, { 'content-type': responseFromServer.contentType });
    res.end(responseFromServer.data);

    console.log('server response');
  }
};

// Clean up function to clear cache map after a certain time interval
const cacheMapCleanUp = () => {
  for (const [key, value] of Object.entries(cacheMap)) {
    if (Date.now() - value.lastReqTime > cacheExpiryTime) {
      delete cacheMap[key];
    }
  }
};

setInterval(cacheMapCleanUp, cleanUpTime);

module.exports = cache;

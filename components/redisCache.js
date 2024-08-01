const fetchFromServer = require('./fetch-from-server');
const http = require('http');
const url = require('url');
require('dotenv').config();
const { createClient } = require('redis');

// Environment Variables
const cacheExpiryTime = parseInt(process.env.CACHE_EXPIRY, 10);
const redisUrl = process.env.REDIS_URL;

console.log(redisUrl)

// New Redis Client
const redisClient = createClient({ url: redisUrl });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log(`Connected to Redis at ${redisUrl}`);
})();

const cache = async (req, res) => {
  if (req.url === '/favicon.ico') {
    return;
  }

  const requestUrl = url.parse(req.url);
  const cacheKey = requestUrl.href;

  // get data from redis
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    const cachedResponse = JSON.parse(cachedData);

    res.writeHead(200, { 'content-type': cachedResponse.contentType });
    res.end(cachedResponse.data);

    console.log('cached response from Redis key: ' + cacheKey);
    return;
  }

  // get data from sever
  const responseFromServer = await fetchFromServer(req, res);

  // set data to redis
  await redisClient.setEx(
    cacheKey,
    cacheExpiryTime,
    JSON.stringify({
      contentType: responseFromServer.contentType,
      data: responseFromServer.data,
    })
  );

  res.writeHead(200, { 'content-type': responseFromServer.contentType });
  res.end(responseFromServer.data);

  console.log('server response (stored in Redis)');
};

module.exports = cache;

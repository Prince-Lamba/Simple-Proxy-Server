require('dotenv').config();

const timeLimit = process.env.TIME_LIMIT * 1000;
const requestLimit = process.env.REQUEST_LIMIT;
const currentTime = Date.now();
const requestMap = new Map();

const rateLimiter = (req, res, next) => {
  if (req.path === '/favicon.ico') {
    next();
    return;
  }

  const clientIP = req.ip;
  const client = requestMap.get(clientIP);

  if (client) {
    let timeDiff = currentTime - client.lastRequestTime;

    if (timeDiff < timeLimit) {
      newRequestCount = client.requestCount + 1;

      if (newRequestCount > requestLimit) {
        res.status(429).json({ error: 'request limit exceeded!' });
        return;
      }

      requestMap.set(clientIP, {
        requestCount: newRequestCount,
        lastRequestTime: client.lastRequestTime,
      });
    } else {
      requestMap.set(clientIP, {
        requestCount: 1,
        lastRequestTime: currentTime,
      });
    }
  } else
    requestMap.set(clientIP, { requestCount: 1, lastRequestTime: currentTime });

  next();
};

module.exports = rateLimiter;

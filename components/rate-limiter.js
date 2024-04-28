require('dotenv').config();

// Environment Variables (Rate Limiter)
const expiryTime = parseInt(process.env.EXPIRY_TIME, 10) * 1000;
const timeLimit = parseInt(process.env.TIME_LIMIT, 10) * 1000;
const requestLimit = parseInt(process.env.REQUEST_LIMIT, 10);

const currentTime = Date.now();
const requestMap = new Map();

const rateLimiter = (req, res, next) => {
  // exclude multiple request within single request (express specific)
  if (req.path === '/favicon.ico') {
    next();
    return;
  }

  const clientIP = req.ip;
  const client = requestMap.get(clientIP);

  if (client) {
    // difference between  clients last request time and current time
    let timeDiff = currentTime - client.lastRequestTime;

    if (timeDiff < timeLimit) {
      //
      newRequestCount = client.requestCount + 1;

      /* 
      if request count is more than the limit then further requests are denied
      until clean up function resets the request count for the client
      */
      if (newRequestCount > requestLimit) {
        res.status(429).json({ error: 'request limit exceeded!' });
        return;
      }

      /*
      if request count is within limit 
      then request map is updated with the new request count
      */
      requestMap.set(clientIP, {
        requestCount: newRequestCount,
        lastRequestTime: client.lastRequestTime,
      });
    } else {
      // reset request count if time difference is greater than the limit
      requestMap.set(clientIP, {
        requestCount: 1,
        lastRequestTime: currentTime,
      });
    }
  } else {
    // create a new entry if client is not present in request map
    requestMap.set(clientIP, { requestCount: 1, lastRequestTime: currentTime });
  }

  next();
};

// Clean up to clear requestMap after expiry time
const reqMapCleanUp = () => {
  const currentTime = Date.now();
  requestMap.forEach((value, key) => {
    if (currentTime - value.lastRequestTime > expiryTime) {
      requestMap.delete(key);
    }
  });
};

setInterval(reqMapCleanUp, expiryTime);

module.exports = rateLimiter;

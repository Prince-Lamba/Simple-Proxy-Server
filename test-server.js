const express = require('express');

const app = express();

app.get('/', (req, res) => {
  /*
  simulate latency/delay in response from 
  server using setTimeout to test caching
  */
  setTimeout(() => {
    res.send('Hello, this is the test server!');
  }, 5000);
});

app.get('/api/data', (req, res) => {
  const data = {
    message: 'This is some test data from the test server',
    timestamp: new Date(),
  };
  res.json(data);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
});

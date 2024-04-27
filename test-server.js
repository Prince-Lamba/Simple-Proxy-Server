const express = require('express');

const app = express();

// Define routes
app.get('/', (req, res) => {
  res.send('Hello, this is the test server!');
});

app.get('/api/data', (req, res) => {
  const data = {
    message: 'This is some test data from the test server',
    timestamp: new Date(),
  };
  res.json(data);
});

// Start the server
// const PORT = process.env.PORT || 3000;

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
});

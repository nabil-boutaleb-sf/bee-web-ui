// Load environment variables from .env file
require('dotenv').config();

// Validate that the API token is loaded. This prevents the app from
// running and sending invalid requests if the .env file is missing or misconfigured.
if (!process.env.BEE_API_TOKEN) {
  console.error('FATAL ERROR: BEE_API_TOKEN is not defined. Please check your .env file.');
  process.exit(1); // Exit the application with an error code.
}

const express = require('express');
const path = require('path');
const beeService = require('./services/beeService');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get facts. Our frontend will call this.
app.get('/api/facts', async (req, res) => {
  try {
    const facts = await beeService.getFacts();
    res.json(facts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch facts.' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
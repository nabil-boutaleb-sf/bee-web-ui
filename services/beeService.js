const axios = require('axios');

// This will be loaded by the main index.js, so we can access process.env here

const api = axios.create({
  baseURL: process.env.BEE_API_BASE_URL || 'https://api.bee.computer/v1',
  headers: {
    'x-api-key': process.env.BEE_API_TOKEN,
    'Content-Type': 'application/json'
  }
});

async function getFacts() {
  try {
    // Based on the API docs, the actual data is in a 'data' property
    const response = await api.get('/facts?confirmed=false');
    return response.data.facts;
  } catch (error) {
    console.error('Error fetching facts from Bee API:', error.message);
    throw new Error('Failed to fetch facts from Bee API.');
  }
}

module.exports = {
  getFacts
};
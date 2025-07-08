// websocket-test.js
require('dotenv').config();
const { io } = require('socket.io-client');

const BEE_API_TOKEN = process.env.BEE_API_TOKEN;
const BEE_API_URL = 'https://api.bee.computer';

if (!BEE_API_TOKEN) {
  console.error('Error: BEE_API_TOKEN is not defined. Please check your .env file.');
  process.exit(1);
}

console.log('Attempting to connect to Bee API WebSocket...');

const socket = io(BEE_API_URL, {
  path: '/sdk',
  extraHeaders: {
    'x-api-key': BEE_API_TOKEN
  }
});

socket.on('connect', () => {
  console.log('✅ Successfully connected to Bee API WebSocket!');
  console.log('Listening for events... (Press Ctrl+C to stop)');
});

socket.on('disconnect', (reason) => {
  console.log(`\n🔌 Disconnected from WebSocket: ${reason}`);
});

socket.on('connect_error', (error) => {
  console.error(`\n❌ Connection Error: ${error.message}`);
});

// This is a special listener that will catch any event
socket.onAny((eventName, ...args) => {
  console.log(`\n🎉 Received event: '${eventName}'`);
  console.log('Data:', JSON.stringify(args, null, 2));
});

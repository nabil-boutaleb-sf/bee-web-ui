require('dotenv').config();
const express = require('express');
const path = require('path');
const beeService = require('./services/beeService');

const app = express();
const port = 3000;

// Exit if the API token is not configured
if (!process.env.BEE_API_TOKEN) {
    console.error('FATAL ERROR: BEE_API_TOKEN is not defined. Please create a .env file with your token.');
    process.exit(1);
}

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Page Routes ---

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Todos page
app.get('/todos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'todos.html'));
});

// Facts page
app.get('/facts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'facts.html'));
});

// --- API Routes ---

// Endpoint to check authentication status
app.get('/api/auth/status', async (req, res) => {
    try {
        const isAuthenticated = await beeService.checkAuthStatus();
        res.json({ isAuthenticated });
    } catch (error) {
        console.error('Error checking auth status:', error);
        res.status(500).json({ isAuthenticated: false, message: 'Failed to check authentication status.' });
    }
});

// Endpoint to get todos
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await beeService.getTodos();
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Failed to fetch todos.' });
    }
});

// Endpoint to get facts
app.get('/api/facts', async (req, res) => {
    try {
        const facts = await beeService.getFacts();
        res.json(facts);
    } catch (error) {
        console.error('Error fetching facts:', error);
        res.status(500).json({ message: 'Failed to fetch facts.' });
    }
});

// TODO: Add PUT /api/todos/:id/complete and DELETE /api/todos/:id, DELETE /api/facts/:id

app.listen(port, () => {
    console.log(`Bee Web UI listening at http://localhost:${port}`);
});

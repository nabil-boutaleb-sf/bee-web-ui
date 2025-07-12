require('dotenv').config();
const express = require('express');
const path = require('path');
const beeService = require('./services/beeService');

const app = express();
const port = 3000;

// Exit if the API token is not configured
// if (!process.env.BEE_API_TOKEN) {
//     console.error('FATAL ERROR: BEE_API_TOKEN is not defined. Please create a .env file with your token.');
//     process.exit(1);
// }

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Add this line to parse JSON bodies


const testApiRouter = require('./routes/testApi');

app.use('/test-api', testApiRouter);

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

// Conversations page
app.get('/conversations', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'conversations.html'));
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const completed = req.query.completed === 'true';

        // The 'completed' parameter is now essential for the service function.
        // It will be either true or false based on the query string.
        const todos = await beeService.getTodos(completed, page, limit, searchTerm);
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to get facts
app.get('/api/facts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const confirmed = req.query.confirmed === 'true';
        const searchTerm = req.query.search || '';
        const facts = await beeService.getFacts(confirmed, page, limit, searchTerm);
        res.json(facts);
    } catch (error) {
        console.error('Error fetching facts:', error);
        res.status(500).json({ message: 'Failed to fetch facts.' });
    }
});


// Endpoint to complete a todo
app.put('/api/todos/:id/complete', async (req, res) => {
    try {
        await beeService.completeTodo(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error completing todo:', error);
        res.status(500).json({ message: 'Failed to complete todo.' });
    }
});

// Endpoint to delete a todo
app.delete('/api/todos/:id', async (req, res) => {
    try {
        await beeService.deleteTodo(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ message: 'Failed to delete todo.' });
    }
});

// Endpoint to update a todo
app.put('/api/todos/:id', async (req, res) => {
    try {
        await beeService.updateTodo(req.params.id, req.body.text);
        res.status(204).send();
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ message: 'Failed to update todo.' });
    }
});

// Endpoint to delete a fact
app.delete('/api/facts/:id', async (req, res) => {
    try {
        await beeService.deleteFact(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting fact:', error);
        res.status(500).json({ message: 'Failed to delete fact.' });
    }
});

// Endpoint to confirm a fact
app.put('/api/facts/:id/confirm', async (req, res) => {
    try {
        await beeService.confirmFact(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error confirming fact:', error);
        res.status(500).json({ message: 'Failed to confirm fact.' });
    }
});

// Endpoint to unconfirm a fact
app.put('/api/facts/:id/unconfirm', async (req, res) => {
    try {
        await beeService.unconfirmFact(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error unconfirming fact:', error);
        res.status(500).json({ message: 'Failed to unconfirm fact.' });
    }
});

// Endpoint to update a fact
app.put('/api/facts/:id', async (req, res) => {
    try {
        await beeService.updateFact(req.params.id, req.body.text);
        res.status(204).send();
    } catch (error) {
        console.error('Error updating fact:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to get conversations
app.get('/api/conversations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const conversationsData = await beeService.getConversations(page, limit, searchTerm);
        res.json(conversationsData);
    } catch (error) {
        console.error('Error fetching conversations:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to bulk delete todos
app.post('/api/todos/bulk-delete', async (req, res) => {
    try {
        const { todoIds } = req.body;
        await beeService.bulkDeleteTodos(todoIds);
        res.status(204).send();
    } catch (error) {
        console.error('Error bulk deleting todos:', error);
        res.status(500).json({ message: 'Failed to bulk delete todos.' });
    }
});

// Endpoint to bulk complete todos
app.post('/api/todos/bulk-complete', async (req, res) => {
    try {
        const { todoIds } = req.body;
        await beeService.bulkCompleteTodos(todoIds);
        res.status(204).send();
    } catch (error) {
        console.error('Error bulk completing todos:', error);
        res.status(500).json({ message: 'Failed to bulk complete todos.' });
    }
});

// Endpoint to bulk delete facts
app.post('/api/facts/bulk-delete', async (req, res) => {
    try {
        const { factIds } = req.body;
        await beeService.bulkDeleteFacts(factIds);
        res.status(204).send();
    } catch (error) {
        console.error('Error bulk deleting facts:', error);
        res.status(500).json({ message: 'Failed to bulk delete facts.' });
    }
});

// Endpoint to bulk confirm facts
app.post('/api/facts/bulk-confirm', async (req, res) => {
    try {
        const { factIds } = req.body;
        await beeService.bulkConfirmFacts(factIds);
        res.status(204).send();
    } catch (error) {
        console.error('Error bulk confirming facts:', error);
        res.status(500).json({ message: 'Failed to bulk confirm facts.' });
    }
});

// Endpoint to bulk unconfirm facts
app.post('/api/facts/bulk-unconfirm', async (req, res) => {
    try {
        const { factIds } = req.body;
        await beeService.bulkUnconfirmFacts(factIds);
        res.status(204).send();
    } catch (error) {
        console.error('Error bulk unconfirming facts:', error);
        res.status(500).json({ message: 'Failed to bulk unconfirm facts.' });
    }
});

app.listen(port, () => {
    console.log(`Bee Web UI listening at http://localhost:${port}`);
});

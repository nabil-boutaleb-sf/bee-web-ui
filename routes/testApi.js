const express = require('express');
const axios = require('axios');
const router = express.Router();

const BEE_API_TOKEN = process.env.BEE_API_TOKEN;
const BEE_API_BASE_URL = process.env.BEE_API_BASE_URL || 'https://api.bee.computer/v1';

router.get('/facts', async (req, res) => {
    try {
        const confirmed = req.query.confirmed === 'true';
        const response = await axios.get(`${BEE_API_BASE_URL}/me/facts`, {
            params: {
                confirmed
            },
            headers: {
                'x-api-key': BEE_API_TOKEN
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching facts from Bee API:', error.message);
        res.status(500).json({ message: 'Failed to fetch facts from Bee API.' });
    }
});

// --- Bulk Todo Endpoints ---
router.post('/todos/bulk-delete', async (req, res) => {
    const { todoIds } = req.body;
    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
        return res.status(400).json({ message: 'Missing or invalid todoIds array.' });
    }
    try {
        // We need to import beeService to call its methods
        const beeService = require('../services/beeService');
        await Promise.all(todoIds.map(id => beeService.deleteTodo(id)));
        res.status(200).json({ message: 'Selected todos deleted successfully.' });
    } catch (error) {
        console.error('Error bulk deleting todos:', error.message);
        res.status(500).json({ message: 'Failed to delete selected todos.' });
    }
});

router.post('/todos/bulk-complete', async (req, res) => {
    const { todoIds } = req.body;
    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
        return res.status(400).json({ message: 'Missing or invalid todoIds array.' });
    }
    try {
        const beeService = require('../services/beeService');
        await Promise.all(todoIds.map(id => beeService.completeTodo(id)));
        res.status(200).json({ message: 'Selected todos completed successfully.' });
    } catch (error) {
        console.error('Error bulk completing todos:', error.message);
        res.status(500).json({ message: 'Failed to complete selected todos.' });
    }
});

// --- Bulk Fact Endpoints ---
router.post('/facts/bulk-delete', async (req, res) => {
    const { factIds } = req.body;
    if (!factIds || !Array.isArray(factIds) || factIds.length === 0) {
        return res.status(400).json({ message: 'Missing or invalid factIds array.' });
    }
    try {
        const beeService = require('../services/beeService');
        await Promise.all(factIds.map(id => beeService.deleteFact(id)));
        res.status(200).json({ message: 'Selected facts deleted successfully.' });
    } catch (error) {
        console.error('Error bulk deleting facts:', error.message);
        res.status(500).json({ message: 'Failed to delete selected facts.' });
    }
});

router.post('/facts/bulk-confirm', async (req, res) => {
    const { factIds } = req.body;
    if (!factIds || !Array.isArray(factIds) || factIds.length === 0) {
        return res.status(400).json({ message: 'Missing or invalid factIds array.' });
    }
    try {
        const beeService = require('../services/beeService');
        await Promise.all(factIds.map(id => beeService.confirmFact(id)));
        res.status(200).json({ message: 'Selected facts confirmed successfully.' });
    } catch (error) {
        console.error('Error bulk confirming facts:', error.message);
        res.status(500).json({ message: 'Failed to confirm selected facts.' });
    }
});

router.post('/facts/bulk-unconfirm', async (req, res) => {
    const { factIds } = req.body;
    if (!factIds || !Array.isArray(factIds) || factIds.length === 0) {
        return res.status(400).json({ message: 'Missing or invalid factIds array.' });
    }
    try {
        const beeService = require('../services/beeService');
        await Promise.all(factIds.map(id => beeService.unconfirmFact(id))); // Assuming unconfirmFact exists
        res.status(200).json({ message: 'Selected facts unconfirmed successfully.' });
    } catch (error) {
        console.error('Error bulk unconfirming facts:', error.message);
        res.status(500).json({ message: 'Failed to unconfirm selected facts.' });
    }
});


module.exports = router;

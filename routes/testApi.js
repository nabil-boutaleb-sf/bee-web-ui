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

module.exports = router;

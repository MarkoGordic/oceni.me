const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();

router.use(express.urlencoded({extended: true}));

router.post('/fetch_logs', async (req, res) => {
    const { userId, offset = 0, limit = 25 } = req.body;
    
    try {
        const logs = await db.getLogs(userId, offset, limit);
        const moreLogsAvailable = logs.length === limit;
        res.json({ logs, moreLogsAvailable });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
});

module.exports = router;
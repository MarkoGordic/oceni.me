const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();

router.use(express.urlencoded({extended: true}));

router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await db.getUserById(req.session.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { first_name, last_name, email, id } = user;

        res.json({
            first_name,
            last_name,
            email,
            id
        });
    } catch (error) {
        console.error("[ERROR] : Error fetching user details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
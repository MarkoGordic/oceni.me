const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');

router.use(express.urlencoded({extended: true}));

router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await db.getEmployeeById(req.session.userId);
        
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

router.post('/new', async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || role === undefined) {
        return res.status(400).json({ error: 'Missing required employee details' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.registerNewEmployee(first_name, last_name, email, hashedPassword, role);
        
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error("[ERROR] : Error creating new employee:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.post('/search', async (req, res) => {
    const { search } = req.body;

    if (!search) {return res.status(400).json({ message: 'Search parameter is required' });}

    try {
        const emplyees = await db.searchEmplyees(search);
        res.json(emplyees);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for emplyees', error: error.message });
    }
});

module.exports = router;
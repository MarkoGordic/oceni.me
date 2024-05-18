const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
require('dotenv').config();
const checkInit = require('../middleware/checkInit');

router.get('/init', async (req, res) => {
    try {
        if (process.env.MAX_DOCKER_CONTAINERS === null || process.env.SESSION_SECRET === null || process.env.DB_USER === null || process.env.DB_PASSWORD === null || process.env.DB_HOST === null || process.env.DB_DATABASE === null) {
            return res.status(400).send("Environment variables not set.");
        }

        const status = await db.getConfigValue('registration_open');
        if (status !== null) {
            return res.status(403).send("Registration is already completed.");
        }

        await db.initDB();
        res.status(200).send("Database initialized.");
    } catch (error) {
        console.error("Error initializing database:", error);
        res.status(500).send("Error initializing database.");
    }
});

router.post('/register', checkInit, async (req, res) => {
    const status = await db.getConfigValue('registration_open');
    if (status !== null) {
        return res.status(403).send("Registration is already completed.");
    }

    const { first_name, last_name, email, password, role, gender } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const employeeId = await db.registerNewEmployee(first_name, last_name, email, hashedPassword, role, gender);

        if (employeeId) {
            await db.setConfigValue('registration_open', 'false');
            res.status(200).send("Account created successfully.");
        } else {
            res.status(500).send("Failed to create new account.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("Error during registration.");
    }
});

module.exports = router;
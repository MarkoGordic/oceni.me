const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const base_url = "http://localhost:3000";

router.use(express.urlencoded({extended: true}));

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.getUserByEmail(email);
        if (!user) {
            console.log("[ERROR] : Login attempt failed. User not found.");
            return res.redirect(base_url + '/?error=user_not_found');
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            req.session.student_id = user.student_id;

            console.log("[INFO] : Login successful for username " + user.username + ".");
            res.redirect(base_url + '/app');
        } else {
            console.log("[ERROR] : Login attempt failed. Incorrect password.");
            res.redirect(base_url + '/?error=incorrect_password');
        }
    } catch (error) {
        console.error("[ERROR] : Error during login:", error);
        res.redirect(base_url + '/?error=login_error');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("[ERROR] : Error clearing session during logout:", err);
            return res.status(500).send("Error logging out");
        }

        res.clearCookie('connect.sid');

        res.redirect(base_url + '/');
    });
});

module.exports = router;
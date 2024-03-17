const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const base_url = "http://localhost:3000";

router.use(express.urlencoded({extended: true}));

router.get('/status', (req, res) => {
    if (req.session.userId) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        const employee = await db.getEmployeeByEmail(email);
        if (!employee) {
            await db.createLogEntry(null, '', `Neuspešan pokušaj logovanja za korisnika ${email}: Korisnik nije pronađen`, 'UPOZORENJE', 'AUTORIZACIJA', req.ip, userAgent);
            return res.redirect(base_url + '/?error=user_not_found');
        }

        const match = await bcrypt.compare(password, employee.password);
        if (match) {
            req.session.userId = employee.id;

            await db.createLogEntry(employee.id, `${employee.first_name} ${employee.last_name}`, 'Korisnik se ulogovao/la na sistem.', 'INFO', 'AUTORIZACIJA', req.ip, userAgent);
            res.status(303).redirect(base_url + '/app');
        } else {
            await db.createLogEntry(employee.id, `${employee.first_name} ${employee.last_name}`, 'Neuspešan pokušaj logovanja, pogrešna lozinka', 'UPOZORENJE', 'AUTORIZACIJA', req.ip, userAgent);
            res.redirect(base_url + '/?error=incorrect_password');
        }
    } catch (error) {
        await db.createLogEntry(null, '', "Došlo je do greške prilikom logovanja: " + error.message, 'GREŠKA', 'AUTORIZACIJA', req.ip, userAgent);
        res.redirect(base_url + '/?error=login_error');
    }
});

router.get('/logout', async (req, res) => {
    const userId = req.session.userId;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(userId);

    req.session.destroy(async (err) => {
        const fullName = employee ? `${employee.first_name} ${employee.last_name}` : '';

        if (err) {
            await db.createLogEntry(userId, fullName, "Došlo je do greške prilikom brisanja korisničke sesije: " + err.message, 'GREŠKA', 'AUTORIZACIJA', req.ip, userAgent);
            return res.status(500).send("Error logging out");
        }

        await db.createLogEntry(userId, fullName, 'Korisnik se izlogovao/la sa sistema', 'INFO', 'AUTORIZACIJA', req.ip, userAgent);
        res.clearCookie('connect.sid');

        res.redirect(base_url + '/');
    });
});

module.exports = router;
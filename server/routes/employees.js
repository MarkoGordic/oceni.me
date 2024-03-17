const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');

router.use(express.urlencoded({extended: true}));
router.use(express.json());

router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const employee = await db.getEmployeeById(req.session.userId);
        
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const { first_name, last_name, email, id } = employee;

        res.json({
            first_name,
            last_name,
            email,
            id
        });
    } catch (error) {
        console.error("[ERROR] : Error fetching employee details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/new', async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);

    if (!first_name || !last_name || !email || !password || role === undefined) {
        return res.status(400).json({ error: 'Missing required employee details' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.registerNewEmployee(first_name, last_name, email, hashedPassword, role);
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Kreiran je novi korisnički naloga za zaposlenog ${first_name} ${last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokusaj kreiranja novog korisničkog naloga za zaposlenog ${first_name} ${last_name}.`, 'ERROR', 'INFO', req.ip, userAgent);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/get/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const employeeData = await db.getEmployeeById(id);
        if (employeeData) {
            res.status(200).json(employeeData);
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (error) {
        console.error("Error fetching employee by ID:", error);
        res.status(500).send("Error fetching employee data");
    }
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);

    try {
        const result = await db.deleteEmployeeById(id);
        if (result) {
            await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Obrisan je korisnički nalog za zaposlenog ${result.first_name} ${result.last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
            res.status(200).send("Employee successfully deleted");
        } else {
            await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokusaj brisanja korisničkog naloga za zaposlenog sa ID ${id}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
            res.status(404).send("Employee not found");
        }
    } catch (error) {
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Došlo je do greške prilikom pokušaja brisanja korisničkog naloga za zaposlenog sa ID ${id}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
        res.status(500).send("Error deleting employee");
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

router.get('/search_professors', async (req, res) => {
    const { search } = req.query;

    if (!search) {
        return res.status(400).json({ message: 'Search parameter is required' });
    }

    try {
        const professors = await db.searchProfessors(search);
        res.json(professors);
    } catch (error) {
        console.error("Error searching for professors:", error);
        res.status(500).json({ message: 'Error searching for professors', error: error.message });
    }
});

module.exports = router;
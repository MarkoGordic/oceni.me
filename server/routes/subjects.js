const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const multer  = require('multer');
const upload = multer();

router.use(express.urlencoded({extended: true}));
router.use(express.json());

router.post('/new', upload.none(), async (req, res) => {
    const { subject_name, code, professorId, year, course_code } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);

    const isUniqueCode = await db.subjectCodeExists(code);
    if (isUniqueCode) {
        return res.status(400).send("Subject code already exists.");
    }

    const isValidProfessor = await db.professorExists(professorId);
    if (!isValidProfessor) {
        return res.status(400).send("Invalid professor ID provided.");
    }

    const isValidCourseCode = await db.courseCodeExists(course_code);
    if (!isValidCourseCode) {
        return res.status(400).send("Invalid course code provided.");
    }

    try {
        await db.addSubject(subject_name, code, professorId, course_code, year);
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Kreiran je novi predmet ${subject_name} (${code})`, 'INFO', 'INFO', req.ip, userAgent);
        res.status(201).send("Subject added successfully");
    } catch (error) {
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokušaj kreiranja novog predmeta ${subject_name} (${code})`, 'GREŠKA', 'INFO', req.ip, userAgent);
        res.status(500).send("Error adding subject");
    }
});

router.get('/get/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const subject = await db.getSubjectById(id);
        if (subject) {
            res.json(subject);
        } else {
            res.status(404).send('Subject not found.');
        }
    } catch (error) {
        console.error('Error getting subject:', error);
        res.status(500).send('Internal server error while fetching subject.');
    }
});

router.post('/update', upload.none(), async (req, res) => {
    const { subject_id, subject_name, code, professor_id, year, course_code } = req.body;

    if (!(subject_id && subject_name && code && professor_id && year && course_code)) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const isValidProfessor = await db.professorExists(professor_id);
        if (!isValidProfessor) {
            return res.status(400).send("Invalid professor ID provided.");
        }

        const isValidCourseCode = await db.courseCodeExists(course_code);
        if (!isValidCourseCode) {
            return res.status(400).send("Invalid course code provided.");
        }

        await db.updateSubject(subject_id, { subject_name, code, professor_id, year, course_code });
        res.status(200).send("Subject updated successfully");
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).send("Error updating subject");
    }
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db.deleteSubjectById(id);
        if (deleted) {
            res.status(200).send("Subject successfully deleted");
        } else {
            res.status(404).send("Subject not found");
        }
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).send("Error deleting subject");
    }
});

router.post('/search', async (req, res) => {
    const { searchString, courseCode, year } = req.body;

    if (!searchString) {
        return res.status(400).json({ message: "Search string is required." });
    }

    try {
        const subjects = await db.searchSubjects(searchString, courseCode, year);
        res.status(200).json(subjects);
    } catch (error) {
        console.error("Error searching subjects:", error);
        res.status(500).json({ message: "Internal server error while searching for subjects." });
    }
});

router.get('/me', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized access. User is not logged in." });
    }

    try {
        const userId = req.session.userId;
        const subjects = await db.getSubjectsForEmployee(userId);
        res.status(200).json(subjects);
    } catch (error) {
        console.error('Error retrieving subjects for employee:', error);
        res.status(500).json({ message: "Internal server error while fetching subjects for employee." });
    }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const multer  = require('multer');
const upload = multer();
const checkIsDekan = require('../middleware/isDekan');
const subjectActions = require('../middleware/subjectActions');

router.use(express.urlencoded({extended: true}));
router.use(express.json());

router.post('/new', checkIsDekan, upload.none(), async (req, res) => {
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

router.get('/get_employees/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
    try {
        const employees = await db.getEmployeesForSubject(subjectId);
        if (employees.length > 0) {
            res.json(employees);
        } else {
            res.status(404).send('No employees found for the given subject.');
        }
    } catch (error) {
        console.error('Error getting employees for subject:', error);
        res.status(500).send('Internal server error while fetching employees.');
    }
});

router.post('/assign_employee', subjectActions, async (req, res) => {
    const { employee_id, subject_id } = req.body;
    
    try {
        const employeeExists = await db.getEmployeeById(employee_id);
        if (!employeeExists) {
            return res.status(404).send('Employee not found.');
        }

        const subjectExists = await db.getSubjectById(subject_id);
        if (!subjectExists) {
            return res.status(404).send('Subject not found.');
        }

        const assignment = await db.assignEmployeeToSubject(employee_id, subject_id);
        if (assignment) {
            res.status(201).send('Employee assigned to subject successfully.');
        } else {
            res.status(400).send('Failed to assign employee to subject.');
        }
    } catch (error) {
        console.error('Error assigning employee to subject:', error);
        res.status(500).send('Internal server error while assigning employee to subject.');
    }
});

router.post('/remove_employee', async (req, res) => {
    const { employeeId, subjectId } = req.body;

    try {
        await db.removeEmployeeFromSubject(employeeId, subjectId);
        res.status(200).send({ message: 'Employee removed from subject successfully.' });
    } catch (error) {
        console.error('Error removing employee from subject:', error);
        res.status(500).send({ error: 'Failed to remove employee from subject.' });
    }
});

router.post('/update', subjectActions, upload.none(), async (req, res) => {
    const { subject_id, name, code, professor_id, year, course_code } = req.body;

    if (!(subject_id && name && code && professor_id && year && course_code)) {
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

        await db.updateSubject(subject_id, { name, code, professor_id, year, course_code });
        res.status(200).send("Subject updated successfully");
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).send("Error updating subject");
    }
});

router.get('/delete/:id', subjectActions, async (req, res) => {
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
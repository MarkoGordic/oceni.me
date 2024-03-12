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
        res.status(201).send("Subject added successfully");
    } catch (error) {
        console.error("Error adding subject:", error);
        res.status(500).send("Error adding subject");
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



module.exports = router;
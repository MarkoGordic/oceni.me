const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const indexNumber = req.body.index_number;
        cb(null, `${indexNumber}${fileExt}`);
    }
});

const upload = multer({ storage: storage });

router.use(express.urlencoded({extended: true}));

router.post('/new', upload.single('profile_image'), async (req, res) => {
    const { first_name, last_name, index_number, email, password, course_code } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const isValidCourseCode = await db.courseCodeExists(course_code);
    if (!isValidCourseCode) {
        return res.status(400).send("Invalid course code provided.");
    }

    try {
        await db.addStudent(first_name, last_name, index_number, email, hashedPassword, course_code);
        res.status(201).send("Student added successfully");
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).send("Error adding student");
    }
});

router.post('/search', async (req, res) => {
    const { search, course_code } = req.body;

    if (!search) {return res.status(400).json({ message: 'Search parameter is required' });}

    try {
        const students = await db.searchStudents(search, course_code);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for students', error: error.message });
    }
});


module.exports = router;

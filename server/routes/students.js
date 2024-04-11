const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads');
        fs.mkdirSync(uploadsDir, { recursive: true });
        cb(null, uploadsDir);
    },

    filename: function(req, file, cb) {
        const fileExt = path.extname(file.originalname);
        cb(null, `${Date.now()}${fileExt}`);
    }
});

const upload = multer({ storage: storage });

router.use(express.urlencoded({extended: true}));

router.post('/new', upload.single('profile_image'), async (req, res) => {
    let { first_name, last_name, index_number, email, password, course_code, gender, subject_id } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);

    const hashedPassword = await bcrypt.hash(password, 10);

    const indexPattern = /^([A-Za-z]{2})\s(\d{1,3})\/(\d{4})$/;
    let formattedIndexNumber = index_number;

    let studentYear;
    if (indexPattern.test(index_number)) {
        let [, letters, numbers, year] = index_number.match(indexPattern);
        studentYear = year;
        const formattedNumbers = numbers.padStart(3, '0');
        formattedIndexNumber = `${letters} ${formattedNumbers}/${year}`;
    } else {
        return res.status(400).send("Invalid index number format.");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).send("Invalid email format.");
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!passwordPattern.test(password)) {
        return res.status(400).send("Password does not meet criteria.");
    }

    if(course_code){
        const isValidCourseCode = await db.courseCodeExists(course_code);
        if (!isValidCourseCode) {
            return res.status(400).send("Invalid course code provided.");
        }
    } else {
        console.log(subject_id);
        subject = await db.getSubjectById(subject_id);
        console.log(subject);
        course_code = subject.course_code;
    }

    try {
        const newStudentId = await db.addStudent(first_name, last_name, formattedIndexNumber, studentYear, email, hashedPassword, course_code, gender);
    
        if (req.file) {
            const targetDir = path.join(__dirname, '../static/student_pfp');
            
            fs.mkdirSync(targetDir, { recursive: true });
            
            const targetPath = path.join(targetDir, `${newStudentId}.jpg`);
            
            try {
                fs.renameSync(req.file.path, targetPath);
            } catch (error) {
                console.error("Error saving profile image:", error);
            }
        }
        
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Uspešno kreiranje korisničkog naloga za studenta ${first_name} ${last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
        res.status(201).send("Student added successfully");
    } catch (error) {
        console.log(error)
        await db.createLogEntry(null, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokušaj kreiranja korisničkog naloga za studenta ${first_name} ${last_name}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send("Student with that index number already exists");
        }
        res.status(500).send("Error adding student");
    }
});

router.post('/update', async (req, res) => {
    const { id, first_name, last_name, index_number, email, password } = req.body;

    if (!id) {
        return res.status(400).send("Student ID is required.");
    }

    const studentData = await db.getStudentById(id);
    if (!studentData) {
        return res.status(404).send("Student not found.");
    }

    const updateData = {
        first_name: first_name || studentData.first_name,
        last_name: last_name || studentData.last_name,
        index_number: index_number || studentData.index_number,
    };

    if(index_number){
        const indexPattern = /^([A-Za-z]{2})\s(\d{1,3})\/(\d{4})$/;
        if (!indexPattern.test(index_number)) {
            return res.status(400).send("Invalid index number format.");
        }
        updateData.index_number = index_number;
    } else
        updateData.index_number = studentData.index_number;


    if(email){
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).send("Invalid email format.");
        }
        updateData.email = email;
    } else
        updateData.email = studentData.email;

    if (password) {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordPattern.test(password)) {
            return res.status(400).send("Password does not meet criteria.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    try {
        await db.updateStudentById(id, updateData);
        res.status(200).send("Student updated successfully");
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).send("Error updating student");
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

router.get('/get/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const studentData = await db.getStudentById(id);
        if (studentData) {
            res.status(200).json(studentData);
        } else {
            res.status(404).send('Student not found');
        }
    } catch (error) {
        console.error("Error fetching student by ID:", error);
        res.status(500).send("Error fetching student data");
    }
});

router.post('/get/indexes', async (req, res) => {
    const { indexes } = req.body;

    if (!indexes || !Array.isArray(indexes) || indexes.length === 0) {
        return res.status(400).send("Indexes array is required and must not be empty.");
    }

    try {
        const students = await db.getStudentsByIndexes(indexes);
        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students by index numbers:", error);
        res.status(500).send("Error fetching students");
    }
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);

    try {
        const result = await db.deleteStudentById(id);
        if (result) {
            await db.createLogEntry(id, `${employee.first_name} ${employee.last_name}`, `Obrisan je korisnički nalog za studenta ${result.first_name} ${result.last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
            res.status(200).send("Student successfully deleted");
        } else {
            await db.createLogEntry(id, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokusaj brisanja korisničkog naloga za studenta sa ID ${id}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
            res.status(404).send("Student not found");
        }
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).send("Error deleting student");
    }
});

router.get('/from_subject/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send("Subject ID is required.");
    }

    try {
        const students = await db.getStudentsFromSubject(id);
        if (students) {
            res.status(200).json(students);
        } else {
            res.status(404).send("Students not found.");
        }
    } catch (error) {
        console.error("Error fetching students based on subject ID:", error);
        res.status(500).send("Error fetching students");
    }
});

module.exports = router;

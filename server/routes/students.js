const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const checkIsAssistant = require('../middleware/isAssistant');
const asyncHandler = require('express-async-handler');

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

router.post('/new', checkIsAssistant, upload.single('profile_image'), async (req, res) => {
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

router.post('/add-multiple', checkIsAssistant, asyncHandler(async (req, res) => {
    const {students, subject_id} = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).send("Invalid input: 'students' must be a non-empty array.");
    }

    let results = [];
    for (const student of students) {
        let { first_name, last_name, index_number, email, password, course_code, gender } = student;

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

        const validation = validateStudentData(first_name, last_name, index_number, email, password, course_code, gender);
        if (!validation.isValid) {
            results.push({ success: false, error: validation.error, index_number });
            continue;
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const studentYear = new Date().getFullYear();
            const studentId = await db.addStudent(first_name, last_name, index_number, studentYear, email, hashedPassword, course_code, gender);
            results.push({ success: true, id: studentId, index_number });
        } catch (error) {
            results.push({ success: false, error: error.message, index_number });
        }
    }

    res.json(results);
}));

function validateStudentData(first_name, last_name, index_number, email, password, course_code, gender) {
    const indexPattern = /^([A-Za-z]{2})\s(\d{1,3})\/(\d{4})$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

    if (!first_name || !last_name || !index_number || !email || !password || !course_code || !gender) {
        return { isValid: false, error: "All fields must be filled." };
    }
    if (!indexPattern.test(index_number)) {
        return { isValid: false, error: "Invalid index number format." };
    }
    if (!emailPattern.test(email)) {
        return { isValid: false, error: "Invalid email format." };
    }
    if (!passwordPattern.test(password)) {
        return { isValid: false, error: "Password does not meet criteria." };
    }
    if (['M', 'F', 'NP'].indexOf(gender) === -1) {
        return { isValid: false, error: "Invalid gender." };
    }

    return { isValid: true };
}

router.post('/update', checkIsAssistant, async (req, res) => {
    const { id, first_name, last_name, index_number, email, password, gender } = req.body;

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

    if (gender) {
        if(gender === "M" || gender === "F")
            updateData.gender = gender;
        else
            updateData.gender = studentData.gender;
    } else
        updateData.gender = studentData.gender;

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

    const employee = await db.getEmployeeById(req.session.userId);

    try {
        await db.updateStudentById(id, updateData);
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Promenjeni su podaci za studenta ${updateData.first_name} ${updateData.last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
        res.status(200).send("Student updated successfully");
    } catch (error) {
        await db.createLogEntry(req.session.userId, `${user.first_name} ${user.last_name}`, `Neuspešan pokusaj promene podataka za studenta sa ID ${id}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
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

router.get('/delete/:id', checkIsAssistant, async (req, res) => {
    const { id } = req.params;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);
    const studentData = await db.getStudentById(id);

    try {
        const tests = await db.getTestsByStudentIndex(studentData.index_number);

        for (const test of tests) {
            const initialStudents = JSON.parse(test.initial_students);
            const finalStudents = JSON.parse(test.final_students);

            const studentPCsSet = new Set([
                ...initialStudents.filter(student => student.index === studentData.index_number).map(student => student.pc),
                ...finalStudents.filter(student => student.index === studentData.index_number).map(student => student.pc)
            ]);

            for (const pc of studentPCsSet) {
                const studentDataPath = path.join(__dirname, `../uploads/tests/${test.id}/data/${pc}`);
                await fsp.rm(studentDataPath, { recursive: true, force: true });
            }

            const updatedInitialStudents = initialStudents.filter(student => student.index !== studentData.index_number);
            const updatedFinalStudents = finalStudents.filter(student => student.index !== studentData.index_number);

            if (initialStudents.length !== updatedInitialStudents.length) {
                await db.updateTestField(test.id, 'initial_students', JSON.stringify(updatedInitialStudents));
            }

            if (finalStudents.length !== updatedFinalStudents.length) {
                await db.updateTestField(test.id, 'final_students', JSON.stringify(updatedFinalStudents));
            }

            await db.deleteTestGradingByStudentId(test.id, id);
        }

        const result = await db.deleteStudentById(id);
        if (result) {
            await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Student ${studentData.first_name} ${studentData.last_name} je potpuno uklonjen iz sistema.`, 'INFO', 'INFO', req.ip, userAgent);
            res.status(200).send("Student je uspešno obrisan i svi povezani podaci su očišćeni.");
        } else {
            await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Pokušaj brisanja studenta ${studentData.first_name} ${studentData.last_name} nije uspeo jer student nije pronađen.`, 'GREŠKA', 'GREŠKA', req.ip, userAgent);
            res.status(404).send("Student nije pronađen");
        }
    } catch (error) {
        console.error("Greška pri brisanju studenta i čišćenju podataka:", error);
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Neuspeli pokušaj potpunog brisanja studenta ${id} zbog greške.`, 'KRITIČNO', 'SISTEM', req.ip, userAgent);
        res.status(500).send("Greška pri brisanju studenta i čišćenju podataka");
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

router.get('/tests/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        const testResults = await db.getTestResultsByStudentId(studentId);
        res.status(200).json(testResults);
    } catch (error) {
        console.error("Error fetching test results:", error);
        res.status(500).send("Error fetching test results");
    }
});

module.exports = router;

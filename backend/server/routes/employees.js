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

        const { first_name, last_name, email, id, role, gender } = employee;

        res.json({
            first_name,
            last_name,
            email,
            id,
            role,
            gender
        });
    } catch (error) {
        console.error("[ERROR] : Error fetching employee details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/me/update', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.userId;
    const { firstName, lastName, email } = req.body;

    if (!firstName && !lastName && !email) {
        return res.status(400).json({ error: 'At least one field must be provided' });
    }

    try {
        const currentUser = await db.getEmployeeById(userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        let logDetails = [];
        if (firstName && firstName !== currentUser.first_name) {
            logDetails.push(`ime: ${currentUser.first_name} -> ${firstName}`);
        }
        if (lastName && lastName !== currentUser.last_name) {
            logDetails.push(`prezime: ${currentUser.last_name} -> ${lastName}`);
        }
        if (email && email !== currentUser.email) {
            logDetails.push(`email: ${currentUser.email} -> ${email}`);
        }

        await db.updateEmployeeInfo(userId, { first_name: firstName, last_name: lastName, email });

        if (logDetails.length > 0) {
            const logMessage = `Izmenjeni su lični podaci korisnika. (${logDetails.join(', ')})`;
            await db.createLogEntry(userId, `${currentUser.first_name} ${currentUser.last_name}`, logMessage, 'INFO', 'INFO', req.ip, req.headers['user-agent']);
        }

        res.status(200).json({ message: 'Employee info updated successfully' });
    } catch (error) {
        console.error("[ERROR] : Error updating employee details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/me/update_pfp', upload.single('profile_image'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.session.userId;
    const originalFilePath = req.file.path;

    try {
        const userExists = await db.getEmployeeById(userId);
        if (!userExists) {
            fs.unlinkSync(originalFilePath);
            return res.status(404).json({ error: 'User not found' });
        }

        const targetDir = path.join(__dirname, '../static/user_pfp');
        fs.mkdirSync(targetDir, { recursive: true });

        const newFileName = `${userId}.jpg`;
        const targetFilePath = path.join(targetDir, newFileName);

        fs.renameSync(originalFilePath, targetFilePath);

        res.status(200).json({ message: 'Profile picture updated successfully' });
    } catch (error) {
        console.error("[ERROR] : Error updating profile picture:", error);
        if (fs.existsSync(originalFilePath)) {
            fs.unlinkSync(originalFilePath);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/reset_password', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Both old and new passwords are required' });
    }

    try {
        const user = await db.getEmployeeById(req.session.userId);

        if (!user || !user.password) {
            return res.status(404).json({ error: 'User or user password not found' });
        }

        const match = await bcrypt.compare(oldPassword, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Old password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db.resetEmployeePassword(req.session.userId, hashedNewPassword);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("[ERROR]: Error resetting password:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/new', upload.single('profile_image'), async (req, res) => {
    const { first_name, last_name, email, password, role, gender } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const employee = await db.getEmployeeById(req.session.userId);

    if (!first_name || !last_name || !email || !password || role === undefined) {
        return res.status(400).json({ error: 'Missing required employee details' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployeeId = await db.registerNewEmployee(first_name, last_name, email, hashedPassword, role, gender);

        if (req.file) {
            const targetDir = path.join(__dirname, '../static/user_pfp');
            
            fs.mkdirSync(targetDir, { recursive: true });
            
            const targetPath = path.join(targetDir, `${newEmployeeId}.jpg`);
            
            try {
                fs.renameSync(req.file.path, targetPath);
            } catch (error) {
                console.error("Error saving profile image:", error);
            }
        }
        
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Kreiran je novi korisnički naloga za zaposlenog ${first_name} ${last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        await db.createLogEntry(req.session.userId, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokusaj kreiranja novog korisničkog naloga za zaposlenog ${first_name} ${last_name}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update', async (req, res) => {
    const { id, first_name, last_name, email, role, gender, password } = req.body;
    const userId = req.session.userId;
    const user = await db.getEmployeeById(userId);

    if (!id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    if (id == 1) {
        return res.status(423).json({ error: 'You cannot modify the superadmin account' });
    }

    if (role === 0) {
        return res.status(403).json({ error: 'You cannot set a user as a superadmin' });
    }

    try {
        const employee = await db.getEmployeeById(id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const updateData = {};
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;

        if (email) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }
            updateData.email = email;
        } else {
            updateData.email = employee.email;
        }

        if (gender) {
            if (gender === "M" || gender === "F") {
                updateData.gender = gender;
            } else {
                updateData.gender = employee.gender;
            }
        } else {
            updateData.gender = employee.gender;
        }

        if (role !== undefined || role !== null)
            updateData.role = role;
        else
            updateData.role = employee.role;

        if (password) {
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
            if (!passwordPattern.test(password)) {
                return res.status(400).json({ error: "Password does not meet criteria." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await db.updateEmployeeInfo(id, updateData);

        await db.createLogEntry( req.session.userId, `${user.first_name} ${user.last_name}`, `Promenjeni su podaci za zaposlenog ${first_name} ${last_name}, uključujući ulogu ${role}.`, 'INFO', 'INFO', req.ip, req.headers['user-agent']
        );

        res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
        await db.createLogEntry( req.session.userId, `${user.first_name} ${user.last_name}`, `Neuspešan pokušaj promene podataka za zaposlenog sa ID ${id}.`, 'GREŠKA', 'GREŠKA', req.ip, req.headers['user-agent']
        );
        console.error("Error updating employee:", error);
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
    const sessionUserId = req.session.userId;

    if (id == sessionUserId) {
        console.log("User tried to delete their own account");
        return res.status(403).send("You cannot delete your own account.");
    }

    const employee = await db.getEmployeeById(sessionUserId);

    try {
        const result = await db.deleteEmployeeById(id);
        if (result) {
            await db.createLogEntry(sessionUserId, `${employee.first_name} ${employee.last_name}`, `Obrisan je korisnički nalog za zaposlenog ${result.first_name} ${result.last_name}.`, 'INFO', 'INFO', req.ip, userAgent);
            res.status(200).send("Employee successfully deleted");
        } else {
            await db.createLogEntry(sessionUserId, `${employee.first_name} ${employee.last_name}`, `Neuspešan pokusaj brisanja korisničkog naloga za zaposlenog sa ID ${id}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
            res.status(404).send("Employee not found");
        }
    } catch (error) {
        await db.createLogEntry(sessionUserId, `${employee.first_name} ${employee.last_name}`, `Došlo je do greške prilikom pokušaja brisanja korisničkog naloga za zaposlenog sa ID ${id}.`, 'GREŠKA', 'INFO', req.ip, userAgent);
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
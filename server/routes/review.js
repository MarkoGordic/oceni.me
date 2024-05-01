const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const database = require('../database');
const db = new database();

router.use(express.urlencoded({extended: true}));

router.get('/files/:testId/:pc/:taskNo', async (req, res) => {
    const { testId, pc, taskNo } = req.params;

    const folderPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, `z${taskNo}`);

    try {
        const files = await fsp.readdir(folderPath);
        res.send(files);
    } catch (err) {
        console.error("Error reading the folder:", err);
        res.status(404).send("Folder not found.");
    }
});

router.get('/code/:testId/:pc/:taskNo/:fileName', async (req, res) => {
    const { testId, pc, taskNo, fileName } = req.params;

    // Validate fileName to include more typical file naming conventions
    if (!/^[a-zA-Z0-9_.-]+$/.test(fileName)) {
        return res.status(400).send("Invalid filename.");
    }

    const dirPath = path.resolve(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, `z${taskNo}`);
    const filePath = path.join(dirPath, fileName);

    if (!filePath.startsWith(dirPath)) {
        return res.status(403).send("Access denied.");
    }

    try {
        const data = await fsp.readFile(filePath, 'utf8');
        res.send(data);
    } catch (err) {
        console.error("Error reading the file:", err);
        res.status(404).send("Datoteka nije pronađena.");
    }
});

router.get('/debugger/:testId/:pc/:taskNo/:testNo', async (req, res) => {
    const { testId, pc, taskNo, testNo } = req.params;

    const filePath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'results', `resultsz${taskNo}${testNo}.json`);

    try {
        const data = await fsp.readFile(filePath, 'utf8');
        res.send(data);
    } catch (err) {
        console.error("Error reading the file:", err);
        res.status(404).send("Datoteka nije pronađena.");
    }
});

router.post('/grading', async (req, res) => {
    const { studentId, testId } = req.body;
    
    if (testId === undefined || studentId === undefined) {
        return res.status(400).json({ error: 'Missing required grading details' });
    }

    try{
        const grading = await db.getTestGradingForStudent(testId, studentId);
        if (grading) {
            res.status(200).json(grading);
        } else {
            res.status(404).send('Grading not found for given student.');
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/grading/save', async (req, res) => {
    const { studentId, testId, grading, total_points } = req.body;
    
    if (testId === undefined || studentId === undefined || grading === undefined) {
        return res.status(400).json({ error: 'Missing required grading details' });
    }

    try{
        const employee_id = req.session.userId;
        await db.updateFinalTestGrading(testId, studentId, total_points, grading, "OCENJEN", employee_id);
        res.status(200).json({ message: 'Grading saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
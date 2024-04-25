const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const database = require('../database');
const db = new database();

router.use(express.urlencoded({extended: true}));

router.get('/code/:testId/:pc/:taskNo', async (req, res) => {
    const { testId, pc, taskNo } = req.params;

    const filePath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, `z${taskNo}`, `z${taskNo}.S`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return res.status(404).send("File not found");
        }
        res.send(data);
    });
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
        const result = await db.updateFinalTestGrading(testId, studentId, total_points, grading, "OCENJEN")
        console.log(result);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('Grading not found for given student.');
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
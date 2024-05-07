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

router.get('/compiler/:testId/:pc/:taskNo/:testNo', async (req, res) => {
    const { testId, pc, taskNo, testNo } = req.params;

    const filePath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'results', `compile_statusz${taskNo}${testNo}.json`);

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

async function copyFiles(sourceDir, targetDir) {
    try {
        const files = await fsp.readdir(sourceDir, { withFileTypes: true });
        for (const file of files) {
            const sourceFilePath = path.join(sourceDir, file.name);
            const targetFilePath = path.join(targetDir, file.name);

            if (file.isDirectory()) {
                await fsp.mkdir(targetFilePath, { recursive: true });
                await copyFiles(sourceFilePath, targetFilePath);
            } else {
                await fsp.copyFile(sourceFilePath, targetFilePath);
            }
        }
    } catch (err) {
        console.error('Error copying files:', err);
        return;
    }
}

router.post('/edits/get', async (req, res) => {
    const { testId, taskNo, pc } = req.body;

    if (!testId || !taskNo || !pc) {
        return res.status(400).json({ error: 'Missing required details' });
    }

    const editsDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', `z${taskNo}`);

    try {
        let items;
        try {
            items = await fsp.readdir(editsDirPath, { withFileTypes: true });
        } catch (readError) {
            if (readError.code === 'ENOENT') {
                return res.status(200).json({ variations: [] });
            }
            console.error('Error reading directory:', readError);
            return res.status(500).json({ error: 'Internal server error while reading directory' });
        }

        const varijationNames = items
            .filter(item => item.isDirectory())
            .map(item => item.name);

        return res.status(200).json({ variations: varijationNames });

    } catch (error) {
        console.error('Error retrieving subfolders:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/edits/new', async (req, res) => {
    const { testId, taskNo, pc, varijationName } = req.body;

    if (!testId || !taskNo || !pc || !varijationName) {
        return res.status(400).json({ error: 'Missing required details' });
    }

    const validName = varijationName.trim().replace(/[^a-zA-Z0-9 ]+/g, '');
    if (!validName) {
        return res.status(400).json({ error: 'Invalid varijation name' });
    }

    const editsDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', `z${taskNo}`);
    const newSubfolderPath = path.join(editsDirPath, validName);
    const sourceDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, `z${taskNo}`);

    try {
        await fsp.mkdir(editsDirPath, { recursive: true });

        let items;
        try {
            items = await fsp.readdir(editsDirPath, { withFileTypes: true });
        } catch (readError) {
            console.error('Error reading directory:', readError);
            return res.status(500).json({ error: 'Internal server error while reading directory' });
        }

        const varijationExists = items.some(item => item.isDirectory() && item.name === validName);
        if (varijationExists) {
            return res.status(409).json({ error: `Varijation with name "${validName}" already exists` });
        }

        try {
            await fsp.mkdir(newSubfolderPath);
            await copyFiles(sourceDirPath, newSubfolderPath);
            return res.status(200).json({ message: `Varijation "${validName}" created and files copied successfully` });
        } catch (mkdirError) {
            console.error('Error creating varijation or copying files:', mkdirError);
            return res.status(500).json({ error: 'Internal server error while creating varijation or copying files' });
        }

    } catch (error) {
        console.error('Error creating main edits directory:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/edits/delete', async (req, res) => {
    const { testId, taskNo, pc, varijationName } = req.body;

    if (!testId || !taskNo || !pc || !varijationName) {
        return res.status(400).json({ error: 'Missing required details' });
    }

    const validName = varijationName.trim().replace(/[^a-zA-Z0-9 ]+/g, '');
    if (!validName) {
        return res.status(400).json({ error: 'Invalid varijation name' });
    }

    const editsDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', `z${taskNo}`);
    const varijationToDelete = path.join(editsDirPath, validName);

    if (!varijationToDelete.startsWith(editsDirPath)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const varijationExists = await fsp.access(varijationToDelete).then(() => true).catch(() => false);

        if (!varijationExists) {
            return res.status(404).json({ error: `Varijation "${validName}" not found` });
        }

        await fsp.rm(varijationToDelete, { recursive: true, force: true });
        return res.status(200).json({ message: `Varijation "${validName}" deleted successfully` });

    } catch (error) {
        console.error('Error deleting varijation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/edits/getfiles', async (req, res) => {
    const { testId, taskNo, pc, varijationName } = req.body;

    if (!testId || !taskNo || !pc || !varijationName) {
        return res.status(400).json({ error: 'Missing required details' });
    }

    const validName = varijationName.trim().replace(/[^a-zA-Z0-9 ]+/g, '');
    if (!validName) {
        return res.status(400).json({ error: 'Invalid variation name' });
    }

    const editsDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', `z${taskNo}`, validName);

    try {
        let files;
        try {
            files = await fsp.readdir(editsDirPath, { withFileTypes: true });
        } catch (readError) {
            if (readError.code === 'ENOENT') {
                return res.status(404).json({ error: `Variation "${validName}" not found` });
            }
            console.error('Error reading directory:', readError);
            return res.status(500).json({ error: 'Internal server error while reading directory' });
        }

        const fileNames = files
            .filter(file => file.isFile())
            .map(file => file.name);

        return res.status(200).send(fileNames);

    } catch (error) {
        console.error('Error retrieving files:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/edits/getfile', async (req, res) => {
    const { testId, taskNo, pc, varijationName, fileName } = req.body;

    if (!testId || !taskNo || !pc || !varijationName || !fileName) {
        return res.status(400).send("Missing required details.");
    }

    const validVarijationName = varijationName.trim().replace(/[^a-zA-Z0-9 ]+/g, '');
    if (!validVarijationName || !fileName.trim()) {
        return res.status(400).send("Invalid input data.");
    }

    const editsDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', `z${taskNo}`, validVarijationName);
    const filePath = path.join(editsDirPath, fileName);

    if (!filePath.startsWith(editsDirPath)) {
        return res.status(403).send("Access denied.");
    }

    try {
        const fileExists = await fsp.access(filePath).then(() => true).catch(() => false);

        if (!fileExists) {
            return res.status(404).send(`File "${fileName}" not found.`);
        }

        const fileContent = await fsp.readFile(filePath, 'utf8');
        return res.send(fileContent);

    } catch (error) {
        console.error('Error retrieving file content:', error);
        return res.status(500).send("Internal server error.");
    }
});

router.post('/edits/updatefile', async (req, res) => {
    const { testId, taskNo, pc, variationName, fileName, newContent } = req.body;

    if (!testId || !taskNo || !pc || !variationName || !fileName || typeof newContent === 'undefined') {
        return res.status(400).json({ error: 'Missing required details' });
    }

    const validVariationName = variationName.trim().replace(/[^a-zA-Z0-9 ]+/g, '');
    if (!validVariationName || !fileName.trim()) {
        return res.status(400).json({ error: 'Invalid variation or file name' });
    }

    const editsDirPath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', `z${taskNo}`, validVariationName);
    const filePath = path.join(editsDirPath, fileName);

    if (!filePath.startsWith(editsDirPath)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const fileExists = await fsp.access(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
            return res.status(404).json({ error: `File "${fileName}" not found` });
        }

        await fsp.writeFile(filePath, newContent, 'utf8');
        return res.status(200).json({ message: `File "${fileName}" successfully updated` });

    } catch (error) {
        console.error('Error updating the file content:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/edits/debugger', async (req, res) => {
    const { testId, pc, taskNo, testNo } = req.body;

    const filePath = path.join(__dirname, '..', 'uploads', 'tests', testId, 'data', pc, 'edits', 'results', `resultsz${taskNo}${testNo}.json`);

    try {
        const data = await fsp.readFile(filePath, 'utf8');
        res.send(data);
    } catch (err) {
        console.error("Error reading the file:", err);
        res.status(404).send("Datoteka nije pronađena.");
    }
});

module.exports = router;
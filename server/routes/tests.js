const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const readline = require('readline');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const testId = req.body.testId;
      const dest = `uploads/tests/${testId}`;
      if (!fs.existsSync(dest)){
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
});  
const upload = multer({ storage: storage });

const testConfigStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const configId = req.body.configId;
    const dest = `uploads/test_configs/${configId}`;
    if (!fs.existsSync(dest)){
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadTestConfig = multer({ storage: testConfigStorage });

router.post('/configure/new', uploadTestConfig.single('zipFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const configId = await db.addNewTestConfig(req.session.userId);
  const zipPath = req.file.path;

  try {
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: `uploads/test_configs/${configId}` }))
      .promise();

    fs.unlinkSync(zipPath);
    res.json({ configId });
  } catch (error) {
    console.error('Error extracting file:', error);
    res.status(500).send('An error occurred while extracting the file.');
  }
});

function convertIndexFormat(index) {
  const match = index.match(/([a-zA-Z]+)(\d+)-(\d+)/);
  if (!match) {
      throw new Error('Invalid index format');
  }
  const [, letters, number, year] = match;

  const paddedNumber = number.padStart(3, '0');

  return `${letters.toUpperCase()} ${paddedNumber}/${year}`;
}

async function getStudentList(testId) {
  const filePath = path.join(__dirname, `../uploads/tests/${testId}/provera/spisak_stud_koji_trenutno_rade_proveru.txt`);

  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist.");
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const students = [];

  for await (const line of rl) {
    const parts = line.split(',').map(part => part.trim());
    if (parts.length > 1) {
      if(parts[1] != '')
        parts[1] = convertIndexFormat(parts[1]);
        students.push([parts[0], parts[1]]);
    }
  }

  return students;
}

router.post('/new', upload.single('zipFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const subjectId = req.body.subjectId;
  const testId = await db.addNewTest(subjectId);
  const zipPath = req.file.path;

  try {
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: `uploads/tests/${testId}` }))
      .promise();

    fs.unlinkSync(zipPath);

    try {
      const studentList = await getStudentList(testId);
      
      console.log(studentList);
      res.json({ testId, studentList });
    } catch (error) {
      console.error('Error reading student list:', error);
      res.status(500).send('Error processing student list.');
    }
  } catch (error) {
    console.error('Error extracting file:', error);
    res.status(500).send('An error occurred while extracting the file.');
  }
});


module.exports = router;
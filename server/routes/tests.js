const express = require('express');
const router = express.Router();
const database = require('../database');
const db = new database();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
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
    const configid = req.body.configid;
    const dest = `uploads/test_configs/${configid}`;
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

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

  router.post('/configure/new', uploadTestConfig.single('zipFile'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const configid = await db.addNewTestConfig(req.session.userId);
    const zipPath = req.file.path;
    const extractPath = `uploads/test_configs/${configid}`;

    try {
        fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .promise()
        .then(async () => {
            await fsp.unlink(zipPath);

            const filenames = await fsp.readdir(extractPath);
            const testFiles = filenames.filter(name => /^t\d{2}/.test(name));
            const filesDetails = [];

            for (const filename of testFiles) {
                const content = await fsp.readFile(`${extractPath}/${filename}`, 'utf-8');
                filesDetails.push({ name: filename, content: content.trimEnd() });
            }

            await db.updateTestConfigStatus(configid, 'OBRADA');
            await db.updateTestConfigs(configid, JSON.stringify(filesDetails));
            
            res.json({ configid, files: filesDetails });
        });
    } catch (error) {
        console.error('Error during file processing:', error);
        res.status(500).send('An error occurred during file processing.');
    }
}));

router.post('/configure/complete', uploadTestConfig.single('solutionFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  if (path.extname(req.file.originalname).toLowerCase() !== '.s') {
    await fsp.unlink(req.file.path);
    return res.status(400).send('File must have the .S extension.');
  }

  const configId = req.body.configid;
  const solutionPath = req.file.path;
  const newPath = `uploads/test_configs/${configId}/output`;
  
  const testsConfig = JSON.parse(req.body.testsConfig);

  const testConfig = await db.getTestConfigById(configId);
  if (!testConfig) {
    return res.status(404).send('Test configuration not found.');
  }

  if (testConfig.status === 'ZAVRSEN') {
    return res.status(403).json({
      message: 'Konfiguracija je već završena.'
    });
  }

  try {
    await fsp.access(newPath, fs.constants.F_OK);
  } catch (error) {
    await fsp.mkdir(newPath, { recursive: true });
  }

  try {
    const newFilePath = path.join(newPath, req.file.originalname);
    await fsp.rename(solutionPath, newFilePath);

    const configFilePath = path.join(newPath, 'config.json');
    await fsp.writeFile(configFilePath, JSON.stringify(testsConfig, null, 2), 'utf8');

    await db.updateTestConfigStatus(configId, 'ZAVRSEN');

    res.send({ success: true });
  } catch (error) {
    console.error('Error moving solution file or writing config:', error);
    res.status(500).send('An error occurred while processing the solution file or writing the config.');
  }
}));

router.get('/status', asyncHandler(async (req, res) => {
  const { configId } = req.query;

  if (!configId) {
      return res.status(400).send('Config ID is required.');
  }

  try {
      const testConfig = await db.getTestConfigById(configId);

      if (!testConfig) {
          return res.status(404).send('Test configuration not found.');
      }

      const response = {
          configId: testConfig.id,
          status: testConfig.status
      };

      if (testConfig.status === 'OBRADA') {
          response.testConfigs = JSON.parse(testConfig.test_configs);
      }

      res.json(response);
  } catch (error) {
      console.error('Error retrieving test configuration status:', error);
      res.status(500).send('An error occurred while retrieving the test configuration status.');
  }
}));


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

  try {
    await fs.access(filePath);

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const students = [];
    for await (const line of rl) {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length > 1 && parts[1] !== '') {
        parts[1] = convertIndexFormat(parts[1]);
        students.push([parts[0], parts[1]]);
      }
    }

    return students;
  } catch (error) {
    console.error(`Error accessing or reading the student list file: ${filePath}`, error);
    throw new Error("File does not exist or cannot be accessed.");
  }
}

router.post('/new', upload.single('zipFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const subjectId = req.body.subjectId;
  const testId = await db.addNewTest(subjectId);
  const zipPath = req.file.path;

  try {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: `uploads/tests/${testId}` }))
      .promise()
      .then(async () => {
        await fsp.unlink(zipPath);

        try {
          const studentList = await getStudentList(testId);
          res.json({ testId, studentList });
        } catch (error) {
          console.error('Error reading student list:', error);
          res.status(500).send('Error processing student list.');
        }
      });
  } catch (error) {
    console.error('Error extracting file:', error);
    res.status(500).send('An error occurred while extracting the file.');
  }
}));

module.exports = router;
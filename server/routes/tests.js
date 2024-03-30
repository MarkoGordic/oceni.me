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
const archiver = require('archiver');
const { generateTestirajSH } = require('../util/student_autotest');

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

    const configid = await db.addNewTestConfig(req.session.userId, req.body.subjectId, req.body.configName);
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
  const outputPath = `uploads/test_configs/${configId}/output`;

  const testsConfig = JSON.parse(req.body.testsConfig);

  const testConfig = await db.getTestConfigById(configId);
  if (!testConfig) {
    return res.status(404).send('Test configuration not found.');
  }

  if (testConfig.status === 'ZAVRSEN') {
    return res.status(403).json({ message: 'Konfiguracija je već završena.' });
  }

  try {
    await fsp.access(outputPath, fs.constants.F_OK);
  } catch (error) {
    await fsp.mkdir(outputPath, { recursive: true });
  }

  generateTestirajSH(testsConfig, path.join(outputPath, 'testiraj.sh'));

  try {
    const newFilePath = path.join(outputPath, req.file.originalname);
    await fsp.rename(solutionPath, newFilePath);

    const configFilePath = path.join(outputPath, 'config.json');
    await fsp.writeFile(configFilePath, JSON.stringify(testsConfig, null, 2), 'utf8');

    const testirajFilePath = path.join(outputPath, 'testiraj.sh');

    const outputZipPath = path.join(outputPath, '..', 'config.zip');
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    archive.file(configFilePath, { name: 'config.json' });
    archive.file(newFilePath, { name: req.file.originalname });
    archive.file(testirajFilePath, { name: 'testiraj.sh' });

    await new Promise((resolve, reject) => {
      output.on('close', async () => {
        try {
          await fsp.rm(outputPath, { recursive: true, force: true });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      archive.on('error', reject);
      archive.finalize();
    });

    const directoryPath = path.join(outputPath, '..');
    const files = await fsp.readdir(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        if (file !== 'config.zip') {
            try {
                await fsp.rm(filePath, { recursive: true, force: true });
            } catch (error) {
                console.error(`Error deleting ${filePath}:`, error);
            }
        }
    }

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

router.post('/config/get_subject', asyncHandler(async (req, res) => {
  const { subjectId } = req.body;

  if (!subjectId) {
    return res.status(400).send('Subject ID is required.');
  }

  try {
    const testConfigs = await db.getTestConfigsForSubject(subjectId);
    if (testConfigs.length === 0) {
      return res.send({'message': '/'});
    }
    res.json(testConfigs);
  } catch (error) {
    console.error('Error retrieving test configurations:', error);
    res.status(500).send('An error occurred while retrieving the test configurations.');
  }
}));

router.get('/config/download/:configId', asyncHandler(async (req, res) => {
  const { configId } = req.params;
  const hasPermission = true;

  if (!hasPermission) {
      return res.status(403).send('You do not have permission to download this file.');
  }

  try {
      const configPath = `uploads/test_configs/${configId}/config.zip`;

      await fsp.access(configPath, fs.constants.F_OK);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=config_${configId}.zip`);

      fs.createReadStream(configPath).pipe(res);
  } catch (error) {
      if (error.code === 'ENOENT') {
          console.error('Config file not found:', error);
          res.status(404).send('Config file not found.');
      } else {
          console.error('Error during file download:', error);
          res.status(500).send('An error occurred during the file download.');
      }
  }
}));

router.get('/config/delete/:configId', asyncHandler(async (req, res) => {
  const { configId } = req.params;
  const hasPermission = true;

  if (!hasPermission) {
    return res.status(403).send('You do not have permission to delete this test configuration.');
  }

  try {
    await db.deleteTestConfigById(configId);
    const configPath = path.join(__dirname, `../uploads/test_configs/${configId}`);

    try {
      await fsp.access(configPath, fs.constants.F_OK);
      await fsp.rm(configPath, { recursive: true, force: true });
      res.send({ success: true, message: 'Test configuration and related files successfully deleted.' });
    } catch (err) {
      console.error('Error deleting directory:', err);
      res.status(404).send('Test configuration directory not found or already deleted.');
    }
  } catch (error) {
    console.error('Error deleting test configuration:', error);
    res.status(500).send('An error occurred while deleting the test configuration.');
  }
}));


module.exports = router;
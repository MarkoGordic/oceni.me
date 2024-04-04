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
      await fs.createReadStream(zipPath)
          .pipe(unzipper.Extract({ path: extractPath }))
          .promise();

      await fsp.unlink(zipPath);

      const directories = await fsp.readdir(extractPath, { withFileTypes: true });
      const folders = directories
          .filter(dirent => dirent.isDirectory() && /^z\d+$/.test(dirent.name))
          .map(dirent => dirent.name);

      let testConfigData = [];

      for (const folder of folders) {
        const folderPath = `${extractPath}/${folder}`;
        const filenames = await fsp.readdir(folderPath);
        const testFiles = filenames.filter(name => /^t\d{2}/.test(name));
        const filesDetails = [];

        for (const filename of testFiles) {
            const content = await fsp.readFile(`${folderPath}/${filename}`, 'utf-8');
            filesDetails.push({ name: filename, content: content.trimEnd() });
        }

        testConfigData.push({
            folder: folder,
            files: filesDetails
        });
      }

      console.log(testConfigData);
      await db.updateTestConfigStatus(configid, 'OBRADA');
      await db.updateTestConfigs(configid, JSON.stringify(testConfigData));
        
      res.json({ configid, data: testConfigData });
  } catch (error) {
      console.error('Error during file processing:', error);
      res.status(500).send('An error occurred during file processing.');
  }
}));

router.post('/configure/complete', uploadTestConfig.single('solutionZIP'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  if (path.extname(req.file.originalname).toLowerCase() !== '.zip') {
    await fsp.unlink(req.file.path);
    return res.status(400).send('File must have the .zip extension.');
  }

  const configId = req.body.configid;
  const solutionPath = req.file.path;
  const outputPath = `uploads/test_configs/${configId}/output`;
  const absoluteOutputPath = path.resolve(outputPath);

  try {
    fs.createReadStream(solutionPath)
      .pipe(unzipper.Extract({ path: outputPath }))
      .promise()
      .then(async () => {
        await fsp.unlink(solutionPath);

        const directories = await fsp.readdir(outputPath, { withFileTypes: true });

        for (const dirent of directories.filter(dirent => dirent.isDirectory() && /^z\d+r$/.test(dirent.name))) {
          const originalDirPath = path.join(outputPath, dirent.name);
          const targetDirName = dirent.name.replace('r', '');
          const targetDirPath = path.join(outputPath, targetDirName);

          await fsp.mkdir(targetDirPath, { recursive: true });

          const filesToMove = await fsp.readdir(originalDirPath);
          for (const fileName of filesToMove) {
            const srcFilePath = path.join(originalDirPath, fileName);
            const destFilePath = path.join(targetDirPath, fileName);
            await fsp.rename(srcFilePath, destFilePath);
          }

          await fsp.rm(originalDirPath, { recursive: true, force: true });
        }

        const testsConfig = JSON.parse(req.body.testsConfig);

        const testConfig = await db.getTestConfigById(configId);
        if (!testConfig) {
          return res.status(404).send('Konfiguracija nije pronađena.');
        }
      
        if (testConfig.status === 'ZAVRSEN') {
          return res.status(403).json({ message: 'Konfiguracija je već završena.' });
        }

        for (let i = 0; i < testsConfig.length; i++) {
          let currentTestAbsolutePath = path.join(absoluteOutputPath, testsConfig[i].folder);
      
          try {
              await fsp.access(currentTestAbsolutePath, fs.constants.F_OK);
          } catch (error) {
              await fsp.mkdir(currentTestAbsolutePath, { recursive: true });
          }
      
          try {
              let currentSolutionPath = path.join(currentTestAbsolutePath, testsConfig[i].folder + ".S");
              await generateTestirajSH(testsConfig[i].files, currentTestAbsolutePath, currentSolutionPath, i);
      
              let resultsPath = path.join(currentTestAbsolutePath, 'results.json');
              let resultsData = await fsp.readFile(resultsPath, 'utf-8');
              let results = JSON.parse(resultsData);
      
              for (let j = 0; j < results.length; j++) {
                testsConfig[i].files[j].result = results[j].output;
                testsConfig[i].files[j].code = results[j].code;
              }
          } catch (error) {
              console.error('An error occurred while generating test configurations or reading results:', error);
              return res.status(500).send('An error occurred while generating test configurations or reading results.');
          }
        }

        try {
          const configFilePath = path.join(outputPath, 'config.json');
          await fsp.writeFile(configFilePath, JSON.stringify(testsConfig, null, 2), 'utf8');
      
          const outputZipPath = path.join(outputPath, '..', 'config.zip');
          const output = fs.createWriteStream(outputZipPath);
          const archive = archiver('zip', { zlib: { level: 9 } });
      
          archive.pipe(output);

          archive.file(configFilePath, { name: 'config.json' });
      
          const archivePromises = testsConfig.map(async (config) => {
              let currentTestAbsolutePath = path.join(absoluteOutputPath, config.folder);
              const filesToDelete = ['get_results.sh', 'results.json'];
              await Promise.all(filesToDelete.map(file => 
                  fsp.unlink(path.join(currentTestAbsolutePath, file)).catch(err => console.error(err))
              ));
      
              archive.directory(currentTestAbsolutePath, config.folder);
          });
      
          await Promise.all(archivePromises);

          output.on('error', (err) => {
              console.log(err);
          });
      
          await archive.finalize();
        } catch (error) {
            console.error('Error processing the solution file or writing the config:', error);
            res.status(500).send('An error occurred while processing the solution file or writing the config.');
        }

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

        await db.updateTestConfigs(configId, JSON.stringify(testsConfig));
        await db.updateTestConfigStatus(configId, 'ZAVRSEN');

        res.send({ success: true, message: 'Processing complete.' });
      })
      .catch((error) => {
        console.error('Error processing the solution ZIP:', error);
        res.status(500).send('An error occurred while processing the solution ZIP.');
      });
  } catch (error) {
    console.error('Error setting up the processing:', error);
    res.status(500).send('An initial setup error occurred.');
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
          status: testConfig.status,
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

router.get('/config/get', asyncHandler(async (req, res) => {
  const { configId } = req.query;

  if (!configId) {
      return res.status(400).send('Config ID is required.');
  }

  try {
      const testConfig = await db.getTestConfigById(configId);

      if (!testConfig) {
          return res.status(404).send('Test configuration not found.');
      }

      res.json(testConfig);
  } catch (error) {
      console.error('Error retrieving test configuration status:', error);
      res.status(500).send('An error occurred while retrieving the test configuration status.');
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
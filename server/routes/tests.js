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

  const configid = await db.addNewTestConfig(req.session.userId, req.body.subjectId, req.body.configName, req.body.testNo);
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
          let folderCount = 0;
          let fileCount = 0;
          let totalPoints = 0;
      
          testsConfig.forEach(folder => {
              folderCount += 1;
              fileCount += folder.files.length;
              totalPoints += folder.files.reduce((acc, file) => acc + file.points, 0);
          });

          let finalConfiguration = {
            name: req.body.configName,
            subject_id: parseInt(req.body.subjectId),
            test_no: parseInt(req.body.testNo),
            total_tasks: folderCount,
            total_tests: fileCount,
            total_points: totalPoints,
            tests_config: testsConfig
          };

          const configFilePath = path.join(outputPath, 'config.json');
          await fsp.writeFile(configFilePath, JSON.stringify(finalConfiguration, null, 2), 'utf8');
      
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

router.get('/config/status', asyncHandler(async (req, res) => {
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
          name: testConfig.name,
          test_no: testConfig.test_no,
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
    await fsp.access(filePath, fs.constants.F_OK);

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const students = [];

    for await (const line of rl) {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length === 3 && parts[1] !== '') {
        const indexFormatted = convertIndexFormat(parts[1]);
        const [firstName, lastName] = parts[2].split(' ');
        students.push({
          index: indexFormatted,
          pc: parts[0],
          firstName: firstName,
          lastName: lastName
        });
      }
    }

    rl.close();
    return students;

  } catch (error) {
    console.error(`Error accessing or reading the student list file: ${filePath}`, error);
    throw new Error("File does not exist or cannot be accessed.");
  }
}

async function determineMissingStudents(testId) {
  const testData = await db.getTestById(testId);
  if (!testData || !testData.initial_students) {
      return {
          studentsFromDB: [],
          missingIndexesWithPC: []
      };
  }

  const studentData = JSON.parse(testData.initial_students);
  const studentIndexes = studentData.map(student => student.index);

  let studentsFromDB = [];
  try {
      studentsFromDB = await db.getStudentsByIndexes(studentIndexes);
  } catch (error) {
      console.error('Error fetching students from DB:', error);
      return {
          studentsFromDB: [],
          missingIndexesWithPC: []
      };
  }

  const studentsWithPCs = studentData.map(student => {
      const dbStudent = studentsFromDB.find(dbSt => dbSt.index_number === student.index);
      return dbStudent ? { ...dbStudent, pc: student.id } : null;
  }).filter(Boolean);

  const foundIndexes = studentsWithPCs.map(student => student.index_number);
  const missingStudents = studentData.filter(student => !foundIndexes.includes(student.index));

  return {
      studentsFromDB: studentsWithPCs,
      missingIndexesWithPC: missingStudents.map(student => ({
          pc: student.id,
          index: student.index,
          first_name: student.firstName,
          last_name: student.lastName
      })),
  };
}


router.post('/new', upload.single('configFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const configPath = req.file.path;

  try {
    const rawData = await fsp.readFile(configPath, 'utf8');
    const configData = JSON.parse(rawData);

    const { name, subject_id, test_no, total_tasks, total_tests, total_points } = configData;

    const testId = await db.addNewTest(subject_id, name, test_no, req.session.userId, total_tasks, total_tests, total_points);

    const savePath = path.join(__dirname, '../uploads', 'tests', String(testId), 'config.json');

    await fsp.mkdir(path.dirname(savePath), { recursive: true });
    await fsp.copyFile(configPath, savePath);
    await fsp.unlink(configPath);

    res.json({ testId, ...configData, status: 'DODATA_KONFIGURACIJA' });
  } catch (error) {
    console.error('Error processing the configuration:', error);
    return res.status(500).send('Error processing the configuration.');
  }
}));

router.post('/upload_data', upload.single('zipFile'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const testId = req.body.testId;
  const zipPath = req.file.path;

  try {
    await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: `uploads/tests/${testId}` }))
        .promise();
  
    await fsp.unlink(zipPath);

    const studentData = await getStudentList(testId);
    await db.updateTestField(testId, 'initial_students', JSON.stringify(studentData));
    await db.updateTestField(testId, 'status', 'DODAT_ZIP');
    
    const { studentsFromDB, missingIndexesWithPC } = await determineMissingStudents(testId);

    res.json({ testId, students: studentsFromDB, missingStudents: missingIndexesWithPC, status: 'DODAT_ZIP' });
  } catch (error) {
      console.error('Error processing student list:', error);
      res.status(500).send('Error processing student list.');
  }
}));

router.post('/confirm_missing_students', asyncHandler(async (req, res) => {
  const { testId, missingStudentIndexes } = req.body;

  if (!testId) {
      return res.status(400).send('Test ID is required.');
  }

  try {
      const testData = await db.getTestById(testId);
      if (!testData || !testData.initial_students) {
          return res.status(404).send('Initial student list not found for the test.');
      }

      let initialStudents = JSON.parse(testData.initial_students);
      const finalStudents = initialStudents.filter(student => !missingStudentIndexes.includes(student.index));
      
      await db.updateTestField(testId, 'final_students', JSON.stringify(finalStudents));
      await db.updateTestField(testId, 'status', 'PODESENI_STUDENTI');

      res.json({ testId, finalStudents, status: 'PODESENI_STUDENTI' });
  } catch (error) {
      console.error('Error finalizing student list:', error);
      res.status(500).send('An error occurred while finalizing the student list.');
  }
}));

router.get('/status', asyncHandler(async (req, res) => {
  const { testId } = req.query;

  if (!testId) {
      return res.status(400).send('Test ID is required.');
  }

  try {
      const testData = await db.getTestById(testId);

      if (!testData) {
          return res.status(404).send('Test configuration not found.');
      }

      const response = {
          configId: testData.id,
          status: testData.status,
          initial_students: testData.initial_students ? JSON.parse(testData.initial_students) : null,
          final_students: testData.final_students ? JSON.parse(testData.final_students) : null,
      };

      if (testData.final_students === null && testData.status !== "DODATA_KONFIGURACIJA") {
          const { studentsFromDB, missingIndexesWithPC } = await determineMissingStudents(testId);
          response.knownStudents = studentsFromDB;
          response.missingStudents = missingIndexesWithPC;
      }

      res.json(response);
  } catch (error) {
      console.error('Error retrieving test status:', error);
      res.status(500).send('An error occurred while retrieving the test status.');
  }
}));

router.post('/complete', asyncHandler(async (req, res) => {
  const { testId, finalStudents } = req.body;
  console.log(req.body);

  if (!testId) {
      return res.status(400).send('Test ID is required.');
  }

  if (!finalStudents || !Array.isArray(finalStudents) || finalStudents.length === 0) {
      return res.status(400).send('A valid list of final students is required.');
  }

  const basePath = path.join(__dirname, `../uploads/tests/${testId}`);
  const proveraPath = path.join(basePath, 'provera');
  const dataPath = path.join(basePath, 'data');

  try {
      await fsp.mkdir(dataPath, { recursive: true });

      for (const student of finalStudents) {
          const { pc } = student;

          const tgzFiles = await fsp.readdir(proveraPath);
          const tgzFile = tgzFiles.find(file => file.endsWith(`_${pc}.tgz`));

          if (!tgzFile) {
              console.log(`No .tgz file found for student PC: ${pc}`);
              continue;
          }

          const tgzFilePath = path.join(proveraPath, tgzFile);
          const studentDataPath = path.join(dataPath, pc);

          await fsp.mkdir(studentDataPath, { recursive: true });

          await fs.createReadStream(tgzFilePath)
              .pipe(unzipper.Extract({ path: studentDataPath }))
              .promise()
              .then(async () => {
                  await fsp.unlink(tgzFilePath);
              });
      }

      res.send({ success: true, message: 'All student data processed and original .tgz files removed.' });
  } catch (error) {
      console.error('Error processing student data:', error);
      res.status(500).send('An error occurred while processing student data.');
  }
}));

router.post('/all', asyncHandler(async (req, res) => {
  const { subjectId } = req.body;

  if (!subjectId) {
    return res.status(400).send('Subject ID is required.');
  }

  try {
    const tests = await db.getTestsForSubject(subjectId);
    if (tests.length === 0) {
      return res.send({'message': '/'});
    }
    res.json(tests);
  } catch (error) {
    console.error('Error retrieving tests:', error);
    res.status(500).send('An error occurred while retrieving the tests.');
  }
}));

module.exports = router;
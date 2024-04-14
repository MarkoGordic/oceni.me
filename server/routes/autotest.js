const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker();
const database = require('../database');
const db = new database();
const async = require('async');
const fs = require('fs');
const fsp = fs.promises;

const dockerQueue = async.queue(async (task, done) => {
  try {
    await docker.run('gcc-build', [], process.stdout, {
      Volumes: {
        '/autotest/data': {},
        '/autotest/conf': {},
        '/output': {}
      },
      Hostconfig: {
        Binds: [
          `${process.cwd()}\\uploads\\tests\\${task.testId}\\data\\${task.pc}\\${task.taskNo}:/autotest/task`,
          `${process.cwd()}\\uploads\\tests\\${task.testId}\\autotestConf\\${task.taskNo}\\${task.testNo}:/autotest/conf`,
          `${process.cwd()}\\uploads\\tests\\${task.testId}\\data\\${task.pc}\\results:/output`
        ]
      }
    }).then(function(data) {
      var output = data[0];
      var container = data[1];
      console.log(output.StatusCode);
      return container.remove();
    }).then(function(data) {
      console.log('container removed');
    });

    const resultsPath = `${process.cwd()}\\uploads\\tests\\${task.testId}\\data\\${task.pc}\\results\\compile_status${task.taskNo}${task.testNo}.json`;
    const resultsData = await fsp.readFile(resultsPath, 'utf8');
    const results = JSON.parse(resultsData);
    if (results.compile === 'success')
      await db.addNewAutoTestResult(task.student_id, parseInt(task.testId), task.employee_id, task.points, task.taskNo, task.testNo);
    else
      await db.addNewAutoTestResult(task.student_id, parseInt(task.testId), task.employee_id, 0, task.taskNo, task.testNo);
 
  } catch (error) {
    console.error('Error running Docker process:', error);
  }
}, 5);

dockerQueue.saturated = () => {
  if (dockerQueue.length() === 250) {
    console.log('Queue is saturated. Maximum queue size reached.');
  }
};

router.post('/run/student', async (req, res) => {
  const { testId, studentIndex, pc } = req.body;
  const employee_id = req.session.userId;
  const student = await db.getStudentsByIndexes([studentIndex]);
  const student_id = student[0].id;

  try {
    const testData = await db.getTestById(testId);
    const tasks = JSON.parse(testData.tasks);

    Object.entries(tasks).forEach(([taskNo, tests]) => {
      Object.entries(tests).forEach(([testNo, points]) => {
        const dockerTask = {
          testId,
          taskNo,
          testNo,
          points,
          pc,
          studentIndex,
          employee_id,
          student_id
        };

        dockerQueue.push(dockerTask);
      });
    });

    await db.addNewTestGrading(student_id, parseInt(testId), employee_id, -1, 'TESTIRANJE');
    res.status(202).send('Docker process queued successfully.');
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Failed to process request.');
  }
});

router.post('/run/group', async (req, res) => {
  const { testId, tasks } = req.body;
  const employee_id = req.session.userId;

  try {
      const testData = await db.getTestById(testId);
      const taskDetails = JSON.parse(testData.tasks);

      for (let task of tasks) {
          const studentIndex = task.studentIndex;
          const pc = task.pc;

          const student = await db.getStudentsByIndexes([studentIndex]);
          const student_id = student[0].id;

          Object.entries(taskDetails).forEach(([taskNo, tests]) => {
              Object.entries(tests).forEach(([testNo, points]) => {
                  const dockerTask = {
                      testId,
                      taskNo,
                      testNo,
                      points,
                      pc,
                      studentIndex: studentIndex,
                      employee_id,
                      student_id
                  };

                  dockerQueue.push(dockerTask);
              });
          });

          await db.addNewTestGrading(student_id, parseInt(testId), employee_id, -1, 'TESTIRANJE');
      }

      res.status(202).send('Docker process queued successfully for all students.');
  } catch (error) {
      console.error('Error processing group request:', error);
      res.status(500).send('Failed to process group request.');
  }
});

router.post('/progress', async (req, res) => {
  const { testId, studentIndexes } = req.body;
  
  try {
    const students = await db.getStudentsByIndexes(studentIndexes);
    const testData = await db.getTestById(testId);
    const totalTasks = testData.total_tests;

    const resultsList = await Promise.all(students.map(async (student) => {
      const student_id = student.id;
      const student_index = student.index_number;
      const results = await db.getAutoTestResultsForStudent(student_id, testId);
      const completedTasks = results.length;
    
      if (completedTasks === totalTasks) {
        let taskResults = {};
        let total_points = 0;

        results.forEach(result => {
          if (!taskResults[result.task_no]) {
            taskResults[result.task_no] = {};
          }
          taskResults[result.task_no][result.test_no] = result.result;
        });

        let totalPointsPerTask = {};
        Object.keys(taskResults).forEach(task => {
          let totalPoints = 0;
          Object.keys(taskResults[task]).forEach(test => {
            totalPoints += taskResults[task][test];
          });
          totalPointsPerTask[task] = totalPoints;
          total_points += totalPoints;
        });

        await db.updateFinalTestGrading(testId, student_id, total_points, JSON.stringify(taskResults), "OCENJEN");
        await db.clearAutoTestResultsForStudent(student_id, testId);
        
        let autotest_progress = 100;
        return {
          studentId: student_id,
          studentIndex: student_index,
          status: 'OCENJEN',
          autotest_progress,
          points: total_points
        };
      } else {
        const tmpGrading = await db.getTestGradingForStudent(testId, student_id);

        if (tmpGrading && tmpGrading.status === 'OCENJEN') {
          return { studentId: student_id, studentIndex: student_index, status: 'OCENJEN', autotest_progress: 100, points: tmpGrading.total_points};
        } else {
          let autotest_progress = Math.floor((completedTasks / totalTasks) * 100);
          return { studentId: student_id, studentIndex: student_index, status: 'TESTIRANJE', autotest_progress, points: '-1'};
      }
    }}));

    res.json(resultsList);
  } catch (error) {
    console.error('Error processing progress check:', error);
    res.status(500).send('Failed to process request.');
  }
});

module.exports = router;

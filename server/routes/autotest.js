const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const database = require('../database');
const db = new Database();
const async = require('async');

const dockerQueue = async.queue(async (task, done) => {
  try {
    await db.updateProcessStatus(task.testId, 'started');

    const container = await docker.run('gcc-build', [], process.stdout, {
      Volumes: { '/task': {} },
      Hostconfig: {
        Binds: [`${process.cwd()}/task/${task.testId}:/output`]
      }
    });

    container.on('stop', async () => {
      await db.updateProcessStatus(task.testId, 'finished');
      done();
    });
  } catch (error) {
    console.error('Error running Docker process:', error);
    done(error);
  }
}, 5);

dockerQueue.saturated = () => {
  if (dockerQueue.length() === 250) {
    console.log('Queue is saturated. Maximum queue size reached.');
  }
};

router.post('/run-docker', (req, res) => {
  dockerQueue.push({ testId: req.body.testId }, (err) => {
    if (err) {
      return res.status(500).send('An error occurred while running the Docker process.');
    }
  });

  res.status(202).send('Docker process queued successfully.');
});

module.exports = router;

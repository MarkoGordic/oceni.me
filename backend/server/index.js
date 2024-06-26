const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const database = require('./database');
const db = new database();
require('dotenv').config();

app.use(express.json());
app.use(express.static('static'));
router.use(express.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(['/user_pfp/:imageName', '/student_pfp/:imageName'], async (req, res, next) => {
  const imageName = req.params.imageName;
  if (imageName === "default.png") {
    res.sendFile(path.join(__dirname, 'static', 'default.png'));
    return;
  }

  const userId = parseInt(imageName.split('.')[0], 10);

  const filePath = path.join(__dirname, 'static', req.originalUrl);

  fs.access(filePath, fs.constants.F_OK, async (err) => {
      if (err) {
          try {
              const gender = await db.getUserGenderById(userId);
              if (gender === 'NP')
                return res.sendFile(path.join(__dirname, 'static', 'default.png'));

              const defaultImage = gender === 'M' ? 'defaultm.png' : 'defaultf.png';
              res.sendFile(path.join(__dirname, 'static', defaultImage));
          } catch (error) {
              console.error('Error fetching user gender:', error);
              res.sendFile(path.join(__dirname, 'static', 'default.png'));
          }
      } else {
          next();
      }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
      next();
  } else {
      req.session.redirectTo = req.originalUrl;
      res.redirect(`http://localhost:3000/?redirect=${encodeURIComponent(req.originalUrl)}`);
  }
}


const InitRoutes = require('./routes/init');
app.use('/init', cors({origin: 'http://localhost:3000', credentials: true}), InitRoutes);
const AuthRoutes = require('./routes/auth');
app.use('/auth', cors({origin: 'http://localhost:3000', credentials: true}), AuthRoutes);
const EmployeesRoutes = require('./routes/employees');
app.use('/employees', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, EmployeesRoutes);
const StudentRoutes = require('./routes/students');
app.use('/students', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, StudentRoutes);
const SubjectsRoutes = require('./routes/subjects');
app.use('/subjects', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, SubjectsRoutes);
const LogRoutes = require('./routes/logs');
app.use('/logs', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, LogRoutes);
const TestRoutes = require('./routes/tests');
app.use('/tests', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, TestRoutes);
const AutoTestRoutes = require('./routes/autotest');
app.use('/autotest', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, AutoTestRoutes);
const ReviewRoutes = require('./routes/review');
app.use('/review', cors({origin: 'http://localhost:3000', credentials: true}), ensureAuthenticated, ReviewRoutes);

app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});
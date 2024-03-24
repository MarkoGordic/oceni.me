const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.static('static'));
router.use(express.urlencoded({extended: true}));

app.use(session({
  secret: 'NadjaImasNajlepseOciNaSvetu!',
  resave: false,
  saveUninitialized: false,
}));

app.use(['/user_pfp/:imageName', '/student_pfp/:imageName'], (req, res, next) => {
  const filePath = path.join(__dirname, 'static', req.originalUrl);

  fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
          res.sendFile(path.join(__dirname, 'static', 'default.png'));
      } else {
          next();
      }
  });
});

const AuthRoutes = require('./routes/auth');
app.use('/auth', cors({origin: 'http://localhost:3000', credentials: true}), AuthRoutes);
const EmployeesRoutes = require('./routes/employees');
app.use('/employees', cors({origin: 'http://localhost:3000', credentials: true}), EmployeesRoutes);
const StudentRoutes = require('./routes/students');
app.use('/students', cors({origin: 'http://localhost:3000', credentials: true}), StudentRoutes);
const SubjectsRoutes = require('./routes/subjects');
app.use('/subjects', cors({origin: 'http://localhost:3000', credentials: true}), SubjectsRoutes);
const LogRoutes = require('./routes/logs');
app.use('/logs', cors({origin: 'http://localhost:3000', credentials: true}), LogRoutes);

app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});
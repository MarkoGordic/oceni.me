const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const session = require('express-session');

app.use(express.json());
app.use(express.static('static'));
router.use(express.urlencoded({extended: true}));

app.use(session({
  secret: 'NadjaImasNajlepseOciNaSvetu!',
  resave: false,
  saveUninitialized: false,
}));

const AuthRoutes = require('./routes/auth');
app.use('/auth', cors({origin: 'http://localhost:3000', credentials: true}), AuthRoutes);
const EmployeesRoutes = require('./routes/employees');
app.use('/employees', cors({origin: 'http://localhost:3000', credentials: true}), EmployeesRoutes);
const StudentRoutes = require('./routes/students');
app.use('/students', cors({origin: 'http://localhost:3000', credentials: true}), StudentRoutes);

app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});
const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

class Database {
    constructor() {
        if (!Database.instance) {
            this.pool = pool;
            this.migrate();
            Database.instance = this;
        }

        return Database.instance;
    }

    async migrate() {
        console.info("[INFO] : Database migration started.");

        const createConfigTable = `
            CREATE TABLE IF NOT EXISTS ocenime_config (
                id INT AUTO_INCREMENT PRIMARY KEY,
                config_key VARCHAR(255) UNIQUE NOT NULL,
                config_value VARCHAR(255)
            );
        `;

        const createeemployeesTable = `
            CREATE TABLE IF NOT EXISTS employees (
                id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                first_name      VARCHAR(100) NOT NULL,
                last_name       VARCHAR(100) NOT NULL,
                password        VARCHAR(100) NOT NULL,
                email           VARCHAR(100) NOT NULL UNIQUE,
                last_login_ip   VARCHAR(15),
                role            TINYINT,
                gender          ENUM('M', 'F')
            );
        `;

        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                gender ENUM('M', 'F', 'NP'),
                year YEAR NOT NULL,
                index_number VARCHAR(20) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL,
                course_code VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                FOREIGN KEY (course_code) REFERENCES courses(code)
                    ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createCoursesTable = `
            CREATE TABLE IF NOT EXISTS courses (
                code VARCHAR(10) NOT NULL PRIMARY KEY,
                name VARCHAR(200) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const populateCoursesTable = `
            INSERT IGNORE INTO courses (name, code) VALUES
                ('Magistarske studije', 'MR'),
                ('Arhitektura i urbanizam (INTEGRISANE STUDIJE)', 'XA'),
                ('Elektrotehnika i računarstvo (INTEGRISANE STUDIJE)', 'XE'),
                ('Geodezija i geomatika (INTEGRISANE STUDIJE)', 'XO'),
                ('Građevinarstvo (INTEGRISANE STUDIJE)', 'XG'),
                ('Grafičko inženjerstvo i dizajn (INTEGRISANE STUDIJE)', 'XF'),
                ('Industrijsko inženjerstvo i menadžment (INTEGRISANE STUDIJE)', 'XI'),
                ('Inženjerstvo zaštite životne sredine i zaštite na radu (INTEGRISANE STUDIJE)', 'XZ'),
                ('Mašinstvo (INTEGRISANE STUDIJE)', 'XM'),
                ('Mehatronika (INTEGRISANE STUDIJE)', 'XH'),
                ('Saobraćaj (INTEGRISANE STUDIJE)', 'XS'),
                ('Animacija u inženjerstvu (OSNOVNE AKADEMSKE STUDIJE)', 'AI'),
                ('Arhitektura (OSNOVNE AKADEMSKE STUDIJE)', 'AR'),
                ('Arhitektura i urbanizam (OSNOVNE AKADEMSKE STUDIJE)', 'AU'),
                ('Biomedicinsko inženjerstvo (OSNOVNE AKADEMSKE STUDIJE)', 'BI'),
                ('Čiste energetske tehnologije (OSNOVNE AKADEMSKE STUDIJE)', 'GT'),
                ('Elektroenergetski softverski inženjering (OSNOVNE AKADEMSKE STUDIJE)', 'E3'),
                ('Energetika i procesna tehnika (OSNOVNE AKADEMSKE STUDIJE)', 'ME'),
                ('Energetika, elektronika i telekomunikacije (OSNOVNE AKADEMSKE STUDIJE)', 'EE'),
                ('Geodezija i geoinformatika (OSNOVNE AKADEMSKE STUDIJE)', 'GE'),
                ('Geodezija i geomatika (OSNOVNE AKADEMSKE STUDIJE)', 'GG'),
                ('Građevinarstvo (OSNOVNE AKADEMSKE STUDIJE)', 'GR'),
                ('Grafičko inženjerstvo i dizajn (OSNOVNE AKADEMSKE STUDIJE)', 'GI'),
                ('Industrijsko inženjerstvo (OSNOVNE AKADEMSKE STUDIJE)', 'II'),
                ('Informacioni inženjering (OSNOVNE AKADEMSKE STUDIJE)', 'IN'),
                ('Inženjerski menadžment (OSNOVNE AKADEMSKE STUDIJE)', 'IM'),
                ('Inženjerstvo informacionih sistema (OSNOVNE AKADEMSKE STUDIJE)', 'IT'),
                ('Inženjerstvo zaštite na radu (OSNOVNE AKADEMSKE STUDIJE)', 'ZR'),
                ('Inženjerstvo zaštite životne sredine (OSNOVNE AKADEMSKE STUDIJE)', 'ZZ'),
                ('Mehanizacija i konstrukciono mašinstvo (OSNOVNE AKADEMSKE STUDIJE)', 'MM'),
                ('Mehatronika (OSNOVNE AKADEMSKE STUDIJE)', 'MH'),
                ('Merenje i regulacija (OSNOVNE AKADEMSKE STUDIJE)', 'EM'),
                ('Poštanski saobraćaj i telekomunikacije (OSNOVNE AKADEMSKE STUDIJE)', 'SP'),
                ('Primenjeno softversko inženjerstvo (OSNOVNE AKADEMSKE STUDIJE)', 'PR'),
                ('Proizvodno mašinstvo (OSNOVNE AKADEMSKE STUDIJE)', 'MP'),
                ('Računarstvo i automatika (OSNOVNE AKADEMSKE STUDIJE)', 'RA'),
                ('Saobraćaj i transport (OSNOVNE AKADEMSKE STUDIJE)', 'ST'),
                ('Scenska arhitektura, tehnika i dizajn (OSNOVNE AKADEMSKE STUDIJE)', 'SA'),
                ('Softversko inženjerstvo i informacione tehnologije - Loznica (OSNOVNE AKADEMSKE STUDIJE)', 'SL'),
                ('Softversko inženjerstvo i informacione tehnologije (OSNOVNE AKADEMSKE STUDIJE)', 'SV'),
                ('Softversko inženjerstvo i informacione tehnologije (OSNOVNE AKADEMSKE STUDIJE)', 'SW'),
                ('Studenti na razmeni', 'ER'),
                ('Tehnička mehanika i dizajn u tehnici (OSNOVNE AKADEMSKE STUDIJE)', 'MT'),
                ('Upravljanje rizikom od katastrofalnih događaja i požara (OSNOVNE AKADEMSKE STUDIJE)', 'ZK'),
                ('Upravljanje rizikom od katastrofalnih događaja i požara (OSNOVNE AKADEMSKE STUDIJE)', 'ZU'),
                ('Elektroenergetika - obnovljivi izvori električne energije (OSNOVNE STRUKOVNE STUDIJE)', 'ES'),
                ('Elektronika i telekomunikacije (OSNOVNE STRUKOVNE STUDIJE)', 'ET'),
                ('Elektrotehnika (OSNOVNE STRUKOVNE STUDIJE)', 'EL'),
                ('Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE)', 'SF'),
                ('Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE)', 'SR'),
                ('Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE) - Inđija', 'RS'),
                ('Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE) - Loznica', 'LO'),
                ('Animacija u inženjerstvu (MASTER AKADEMSKE STUDIJE)', 'F2'),
                ('Arhitektura (MASTER AKADEMSKE STUDIJE)', 'A7'),
                ('Arhitektura i urbanizam (MASTER AKADEMSKE STUDIJE)', 'A1'),
                ('Biomedicinsko inženjerstvo (MASTER AKADEMSKE STUDIJE)', 'B1'),
                ('Čiste energetske tehnologije (MASTER AKADEMSKE STUDIJE)', 'C1'),
                ('Digitalne tehnike, dizajn i produkcija u arhitekturi (MASTER AKADEMSKE STUDIJE)', 'A8'),
                ('Digitalne tehnike, dizajn i produkcija u aritekturi i urbanizmu (MASTER AKADEMSKE STUDIJE)', 'A4'),
                ('Elektroenergetski softverski inženjering (MASTER AKADEMSKE STUDIJE)', 'E4'),
                ('Energetika i procesna tehnika (MASTER AKADEMSKE STUDIJE)', 'M3'),
                ('Energetika, elektronika i telekomunikacije (MASTER AKADEMSKE STUDIJE)', 'E1'),
                ('Energetski menadžment (MASTER AKADEMSKE STUDIJE)', 'I3'),
                ('Geodezija i geoinformatika (MASTER AKADEMSKE STUDIJE)', 'O2'),
                ('Geodezija i geomatika (MASTER AKADEMSKE STUDIJE)', 'O1'),
                ('Građevinarstvo (MASTER AKADEMSKE STUDIJE)', 'G1'),
                ('Grafičko inženjerstvo i dizajn (MASTER AKADEMSKE STUDIJE)', 'F1'),
                ('Industrijsko inženjerstvo - Napredne inženjerske tehnologije (MASTER AKADEMSKE STUDIJE)', 'I5'),
                ('Industrijsko inženjerstvo - Razvoj i upravljanje životnih ciklusa proizvoda (MASTER AKADEMSKE STUDIJE)', 'I4'),
                ('Industrijsko inženjerstvo (MASTER AKADEMSKE STUDIJE)', 'I1'),
                ('Informaciona bezbednost (MASTER AKADEMSKE STUDIJE)', 'I9'),
                ('Informacioni i analitički inženjering (MASTER AKADEMSKE STUDIJE)', 'E6'),
                ('Informacioni inženjering (MASTER AKADEMSKE STUDIJE)', 'E7'),
                ('Inženjerski menadžment (MASTER AKADEMSKE STUDIJE)', 'I2'),
                ('Inženjerstvo informacionih sistema (MASTER AKADEMSKE STUDIJE)', 'I7'),
                ('Inženjerstvo inovacija (MASTER AKADEMSKE STUDIJE)', 'I8'),
                ('Inženjerstvo tretmana i zaštite voda (MASTER AKADEMSKE STUDIJE)', 'Z4'),
                ('Inženjerstvo tretmana i zaštite voda (TEMPUS MASTER AKADEMSKE STUDIJE)', 'Z3'),
                ('Inženjerstvo zaštite na radu (MASTER AKADEMSKE STUDIJE)', 'Z2'),
                ('Inženjerstvo zaštite životne sredine (MASTER AKADEMSKE STUDIJE)', 'Z1'),
                ('Logističko inženjerstvo i menadžment (MASTER AKADEMSKE STUDIJE)', 'I6'),
                ('Matematika u tehnici (MASTER AKADEMSKE STUDIJE)', 'V1'),
                ('Matematika u tehnici (MASTER AKADEMSKE STUDIJE)', 'V2'),
                ('Mehanizacija i konstrukciono mašinstvo (MASTER AKADEMSKE STUDIJE)', 'M2'),
                ('Mehatronika (MASTER AKADEMSKE STUDIJE)', 'H1'),
                ('Merenje i regulacija (MASTER AKADEMSKE STUDIJE)', 'E8'),
                ('Planiranje i upravljanje regionalnim razvojom (MASTER AKADEMSKE STUDIJE)', 'A3'),
                ('Poštanski saobraćaj i telekomunikacije (MASTER AKADEMSKE STUDIJE)', 'S2'),
                ('Primenjeno softversko inženjerstvo (MASTER AKADEMSKE STUDIJE)', 'E5'),
                ('Proizvodno mašinstvo (MASTER AKADEMSKE STUDIJE)', 'M1'),
                ('Računarstvo i automatika (MASTER AKADEMSKE STUDIJE)', 'E2'),
                ('Regionalna politika i razvoj (MASTER AKADEMSKE STUDIJE)', 'A2'),
                ('Saobraćaj i transport (MASTER AKADEMSKE STUDIJE)', 'S1'),
                ('Scenska arhitektura i dizajn (MASTER AKADEMSKE STUDIJE)', 'A5'),
                ('Scenska arhitektura i tehnika (MASTER AKADEMSKE STUDIJE)', 'A6'),
                ('Softversko inženjerstvo i informacione tehnologije (MASTER AKADEMSKE STUDIJE)', 'R1'),
                ('Softversko inženjerstvo i informacione tehnologije (MASTER AKADEMSKE STUDIJE)', 'R2'),
                ('Tehnička mehanika i dizajn u tehnici (MASTER AKADEMSKE STUDIJE)', 'M4'),
                ('Upravljanje rizikom od katastrofalnih događaja i požara (MASTER AKADEMSKE STUDIJE)', 'ZP'),
                ('Veštačka inteligencija i mašinsko učenje (MASTER AKADEMSKE STUDIJE)', 'E9'),
                ('Specijalističke akademske studije - Arhitektura', 'AJ'),
                ('Specijalističke akademske studije - Arhitektura i urbanizam (dvogodišnje studije)', 'AS'),
                ('Specijalističke akademske studije - Energetika, elektronika i telekomunikacije', 'EJ'),
                ('Specijalističke akademske studije - Energetika, elektronika i telekomunikacije  (dvogodišnje studije)', 'TS'),
                ('Specijalističke akademske studije - Geodezija i geomatika', 'OJ'),
                ('Specijalističke akademske studije - Industrijsko inženjerstvo', 'NJ'),
                ('Specijalističke akademske studije - Inženjerski menadžment', 'ID'),
                ('Specijalističke akademske studije - Inženjerski menadžment', 'IJ'),
                ('Specijalističke akademske studije - Inženjerski menadžment  (dvogodišnje studije)', 'IS'),
                ('Specijalističke akademske studije - Inženjerstvo zaštite životne sredine', 'ZJ'),
                ('Specijalističke akademske studije - Inženjerstvo zaštite životne sredine  (dvogodišnje studije)', 'ZS'),
                ('Specijalističke akademske studije - Saobraćaj', 'SS'),
                ('Specijalističke akademske studije- Energetska efikasnost u zgradarstvu', 'EF'),
                ('Specijalističke strukovne studije - MBA', 'MB'),
                ('Strukovne specijalističke studije - Energetika, elektronika i telekomunikacije', 'SE'),
                ('Strukovne specijalističke studije - Inženjerski menadžment', 'SI'),
                ('Strukovne specijalističke studije - Inženjerstvo zaštite životne sredine i bezbednosti i zaštite na radu', 'SZ'),
                ('Elektrotehnika (MASTER STRUKOVNE STUDIJE)', 'PE'),
                ('Inženjerski menadžment MBA (MASTER STRUKOVNE STUDIJE)', 'PI'),
                ('Proizvodno mašinstvo (MASTER STRUKOVNE STUDIJE)', 'PM'),
                ('Doktorske studije - Animacija u inženjerstvu', 'DU'),
                ('Doktorske studije - Arhitektura', 'DC'),
                ('Doktorske studije - Arhitektura i urbanizam', 'DA'),
                ('Doktorske studije - Biomedicinsko inženjerstvo', 'DL'),
                ('Doktorske studije - Energetika, elektronika i telekomunikacije', 'DE'),
                ('Doktorske studije - Geodezija i geoinformatika', 'DJ'),
                ('Doktorske studije - Geodezija i geomatika', 'DO'),
                ('Doktorske studije - Građevinarstvo', 'DG'),
                ('Doktorske studije - Grafičko inženjerstvo i dizajn', 'DF'),
                ('Doktorske studije - Industrijsko inženjerstvo/Inženjerski menadžment', 'DI'),
                ('Doktorske studije - Inženjerstvo informacionih sistema', 'DV'),
                ('Doktorske studije - Inženjerstvo zaštite na radu', 'DD'),
                ('Doktorske studije - Inženjerstvo zaštite životne sredine', 'DZ'),
                ('Doktorske studije - Mašinstvo', 'DM'),
                ('Doktorske studije - Matematika u tehnici', 'DT'),
                ('Doktorske studije - Mehatronika', 'DH'),
                ('Doktorske studije - Računarstvo i automatika', 'DP'),
                ('Doktorske studije - Saobraćaj', 'DS'),
                ('Doktorske studije - Scenski dizajn', 'DN'),
                ('Doktorske studije - Tehnička mehanika', 'DB'),
                ('Doktorske studije - Upravljanje rizikom od katastrofalnih događaja i požara', 'DK'),
                ('Doktorske studije (studenti upisani od 2006 do 2010)', 'DR');
        `;

        const createSubjectsTable = `
            CREATE TABLE IF NOT EXISTS subjects (
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(200) NOT NULL,
                professor_id INT NOT NULL,
                course_code VARCHAR(10) NOT NULL,
                year YEAR NOT NULL,
                FOREIGN KEY (professor_id) REFERENCES employees(id) ON DELETE CASCADE,
                FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createSubjectEmployeesTable = `
            CREATE TABLE IF NOT EXISTS employee_subjects (
                employee_id INT NOT NULL,
                subject_id INT NOT NULL,
                PRIMARY KEY (employee_id, subject_id),
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `;

        const createSystemActivityLogsTable = `
            CREATE TABLE IF NOT EXISTS system_activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT,
                employee VARCHAR(255),
                message TEXT NOT NULL,
                severity ENUM('DEBUG', 'INFO', 'UPOZORENJE', 'GREŠKA', 'KRITIČNO') NOT NULL,
                log_type ENUM('AUTORIZACIJA', 'INFO', 'SISTEM', 'GREŠKA'),
                ip VARCHAR(39),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createTestsTable = `
            CREATE TABLE IF NOT EXISTS tests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                employee_id INT,
                name VARCHAR(255) NOT NULL,
                test_no INT NOT NULL,
                total_tasks INT NOT NULL,
                total_tests INT NOT NULL,
                total_points INT NOT NULL,
                initial_students TEXT,
                final_students TEXT,
                tasks TEXT,
                status ENUM('DODATA_KONFIGURACIJA', 'DODAT_TAR', 'PODESENI_STUDENTI', 'ZAVRSEN') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createTestConfigurationsTable = `
            CREATE TABLE IF NOT EXISTS test_configs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                employee_id INT,
                subject_id INT NOT NULL,
                test_no INT NOT NULL,
                test_configs TEXT NOT NULL,
                status ENUM('KREIRAN', 'OBRADA', 'ZAVRSEN') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createTestGradingsTable = `
            CREATE TABLE IF NOT EXISTS test_gradings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                test_id INT NOT NULL,
                employee_id INT,
                total_points INT NOT NULL,
                gradings TEXT,
                status ENUM('NEMA_FAJLOVA', 'TESTIRANJE', 'AT OCENJEN', 'OCENJEN') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createAutoTestResultsTable = `
            CREATE TABLE IF NOT EXISTS auto_test_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                test_id INT NOT NULL,
                task_no VARCHAR(10) NOT NULL,
                test_no VARCHAR(10) NOT NULL,
                employee_id INT,
                result INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createVariationsTable = `
            CREATE TABLE IF NOT EXISTS variations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                test_id INT NOT NULL,
                task_no INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createVariationTestResultsTable = `
            CREATE TABLE IF NOT EXISTS variation_test_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                variation_id INT NOT NULL,
                test_no VARCHAR(10) NOT NULL,
                result INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variation_id) REFERENCES variations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createFinalVariationResultsTable = `
            CREATE TABLE IF NOT EXISTS final_variation_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                variation_id INT NOT NULL,
                results TEXT,
                total_points INT NOT NULL,
                status ENUM('TESTIRANJE', 'AT OCENJEN') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variation_id) REFERENCES variations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        try {
            await this.pool.execute(createConfigTable);
            console.info("[INFO] : Config table created successfully.");
            await this.pool.execute(createeemployeesTable);
            console.info("[INFO] : Employees table created successfully.");
            await this.pool.execute(createCoursesTable);
            console.info("[INFO] : Courses table created successfully.");
            await this.pool.execute(populateCoursesTable);
            console.info("[INFO] : Courses table populated successfully.");
            await this.pool.execute(createStudentsTable);
            console.info("[INFO] : Students table created successfully.");
            await this.pool.execute(createSubjectsTable);
            console.info("[INFO] : Subjects table created successfully.");
            await this.pool.execute(createSubjectEmployeesTable);
            console.info("[INFO] : Employee-Subjects table created successfully.");
            await this.pool.execute(createSystemActivityLogsTable);
            console.info("[INFO] : System activity logs table created successfully.");
            await this.pool.execute(createTestsTable);
            console.info("[INFO] : Tests table created successfully.");
            await this.pool.execute(createTestConfigurationsTable);
            console.info("[INFO] : Test configurations table created successfully.");
            await this.pool.execute(createTestGradingsTable);
            console.info("[INFO] : Test gradings table created successfully.");
            await this.pool.execute(createAutoTestResultsTable);
            console.info("[INFO] : Auto test results table created successfully.");
            await this.pool.execute(createVariationsTable);
            console.info("[INFO] : Variations table created successfully.");
            await this.pool.execute(createVariationTestResultsTable);
            console.info("[INFO] : Variation test results table created successfully.");
            await this.pool.execute(createFinalVariationResultsTable);
            console.info("[INFO] : Final variation results table created successfully.");
        } catch (err) {
            console.error("[ERROR] : Error while running SQL.", err);
        }
    }

    async initDB() {
        const initializeConfig = `
            INSERT INTO ocenime_config (config_key, config_value) VALUES
                ('registration_open', NULL);
        `;
        const initializeEmployees = `
            INSERT INTO employees (first_name, last_name, email, password, role, gender) VALUES
                ('Nađa', 'Jakšić', 'nadjajaksice34@gmail.com', '$2b$10$a4rR5.axsDtur84RM7KeFe1SuizbRVsoIIDMrkuPnAnrKSQV/SEZS', 0, 'F');
        `;

        try {
            await this.pool.execute(initializeConfig);
            console.info("[INFO] : Config table initialized successfully.");
            await this.pool.execute(initializeEmployees);
            console.info("[INFO] : Employees table initialized successfully.");
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    async checkIsDBInitialized() {
        try {
            const [rows] = await this.pool.query("SELECT config_value FROM ocenime_config WHERE config_key = 'registration_open'");
            return rows;
        } catch (error) {
            console.error('Error checking if DB is initialized:', error);
            return false;
        }
    }

    async setConfigValue(key, value) {
        try {
            const [result] = await this.pool.query('INSERT INTO ocenime_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?', [key, value, value]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error setting config value:', error);
            return false;
        }
    }

    async getConfigValue(key) {
        try {
            const [rows] = await this.pool.query('SELECT config_value FROM ocenime_config WHERE config_key = ?', [key]);
            return rows.length > 0 ? rows[0].config_value : null;
        } catch (error) {
            console.error('Error getting config value:', error);
            return null;
        }
    }

    async getEmployeeByEmail(email) {
        const query = 'SELECT * FROM employees WHERE email = ?';
        try {
            const [results] = await this.pool.query(query, [email]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async getEmployeeById(id) {
        const query = 'SELECT first_name, last_name, email, id, role, gender, password FROM employees WHERE id = ?';
        try {
            const [results] = await this.pool.query(query, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async getEmployeesByIds(employeeIds) {
        const placeholders = employeeIds.map(() => '?').join(',');
        const query = `SELECT id, first_name, last_name FROM employees WHERE id IN (${placeholders})`;
        try {
            const [results] = await this.pool.query(query, employeeIds);
            return results;
        } catch (error) {
            console.error('Error retrieving employees by IDs:', error);
            throw error;
        }
    }

    async deleteEmployeeById(id) {
        const query = 'DELETE FROM employees WHERE id = ?';
        try {
            const [result] = await this.pool.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }

    async registerNewEmployee(firstName, lastName, email, hashedPassword, role, gender) {
        const query = 'INSERT INTO employees (first_name, last_name, email, password, role, gender) VALUES (?, ?, ?, ?, ?, ?)';
        try {
            const [result] = await this.pool.query(query, [firstName, lastName, email, hashedPassword, role, gender]);
            const selectQuery = `SELECT id FROM employees WHERE email = ? LIMIT 1`;
            const [rows] = await this.pool.query(selectQuery, [email]);
            if (rows.length > 0) {
                return rows[0].id;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    async getUserGenderById(userId) {
        console.log("USER ID : ", userId);
        const [rows] = await this.pool.query('SELECT gender FROM employees WHERE id = ?', [userId]);
        if (rows.length > 0) {
            return rows[0].gender;
        } else {
            return "NP";
        }
    }

    async updateEmployeeInfo(userId, updateFields) {
        if (userId == 1)
            return false;

        console.log(updateFields);
        let query = `UPDATE employees SET `;
        let queryParams = [];
        let setParts = [];

        if (updateFields.first_name) {
            setParts.push(`first_name = ?`);
            queryParams.push(updateFields.first_name);
        }
        if (updateFields.last_name) {
            setParts.push(`last_name = ?`);
            queryParams.push(updateFields.last_name);
        }
        if (updateFields.email) {
            setParts.push(`email = ?`);
            queryParams.push(updateFields.email);
        }
        if (updateFields.role !== undefined || updateFields.role !== null) {
            setParts.push(`role = ?`);
            queryParams.push(updateFields.role);
        }
        if (updateFields.gender) {
            setParts.push(`gender = ?`);
            queryParams.push(updateFields.gender);
        }
        if (updateFields.password) {
            setParts.push(`password = ?`);
            queryParams.push(updateFields.password);
        }

        if (setParts.length === 0) {
            throw new Error("No fields provided for update");
        }

        query += setParts.join(', ') + ` WHERE id = ?`;
        queryParams.push(userId);

        try {
            const [result] = await this.pool.query(query, queryParams);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating employee info:', error);
            throw error;
        }
    }

    async resetEmployeePassword(userId, hashedNewPassword) {
        const query = 'UPDATE employees SET password = ? WHERE id = ?';
        try {
            const [result] = await this.pool.query(query, [hashedNewPassword, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error resetting employee password:', error);
            throw error;
        }
    }

    async addStudent(first_name, last_name, index_number, year, email, password, course_code, gender) {
        const insertQuery = `
            INSERT INTO students (first_name, last_name, index_number, year, email, password, course_code, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            await this.pool.query(insertQuery, [first_name, last_name, index_number, year, email, password, course_code, gender]);
            const selectQuery = `SELECT id FROM students WHERE email = ? LIMIT 1`;
            const [rows] = await this.pool.query(selectQuery, [email]);
            if (rows.length > 0) {
                return rows[0].id;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    async updateStudentById(id, updateData) {
        let query = 'UPDATE students SET ';
        const queryParams = [];
        const setParts = [];

        if (updateData.index_number) {
            const indexPattern = /^([A-Za-z]{2})\s(\d{1,3})\/(\d{4})$/;
            const match = updateData.index_number.match(indexPattern);

            if (!match) {
                throw new Error('Invalid index number format.');
            }

            const [, , , year] = match;
            updateData.year = year;
        }

        for (const [key, value] of Object.entries(updateData)) {
            setParts.push(`${key} = ?`);
            queryParams.push(value);
        }

        if (setParts.length === 0) {
            throw new Error('No update fields provided');
        }

        query += setParts.join(', ') + ' WHERE id = ?';
        queryParams.push(id);

        try {
            const [result] = await this.pool.query(query, queryParams);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating student info:', error);
            throw error;
        }
    }


    async getStudentById(id) {
        const query = 'SELECT first_name, last_name, email, index_number, year, course_code, id, gender FROM students WHERE id = ?';
        try {
            const [results] = await this.pool.query(query, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async deleteStudentById(id) {
        const query = 'DELETE FROM students WHERE id = ?';
        try {
            const [result] = await this.pool.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }

    async courseCodeExists(course_code) {
        const query = 'SELECT 1 FROM courses WHERE code = ?';
        try {
            const [results] = await this.pool.query(query, [course_code]);
            return results.length > 0;
        } catch (error) {
            throw error;
        }
    }

    async searchStudents(searchString, courseCode, page, limit = 20) {
        let query = `
            SELECT * FROM students
            WHERE (index_number LIKE CONCAT('%', ? COLLATE utf8mb4_unicode_ci, '%') 
            OR first_name LIKE CONCAT('%', ? COLLATE utf8mb4_unicode_ci, '%') 
            OR last_name LIKE CONCAT('%', ? COLLATE utf8mb4_unicode_ci, '%'))
        `;

        const params = [searchString, searchString, searchString];

        if (courseCode) {
            query += ' AND course_code = ?';
            params.push(courseCode);
        }

        query += ' ORDER BY index_number';
        query += ' LIMIT ? OFFSET ?';

        const offset = (page - 1) * limit;
        params.push(limit, offset);

        try {
            const [results] = await this.pool.query(query, params);
            if (results.length === 0) {
                return [];
            }

            const courseCodes = results.map(student => student.course_code);
            if (courseCodes.length > 0) {
                const coursesQuery = 'SELECT code, name FROM courses WHERE code IN (?)';
                const [courseNames] = await this.pool.query(coursesQuery, [courseCodes]);

                const courseCodeToNameMap = courseNames.reduce((map, course) => {
                    map[course.code] = course.name;
                    return map;
                }, {});

                const modifiedResults = results.map(student => ({
                    ...student,
                    course_name: courseCodeToNameMap[student.course_code] || 'Nepoznat studijski program'
                }));

                return modifiedResults;
            }
            return results;
        } catch (error) {
            console.error('Error searching for students:', error);
            throw error;
        }
    }

    async getStudentsFromSubject(subjectId) {
        const subjectQuery = `
            SELECT year, course_code FROM subjects WHERE id = ?
        `;

        try {
            const [subjectResult] = await this.pool.query(subjectQuery, [subjectId]);
            if (subjectResult.length === 0) {
                throw new Error('Subject not found.');
            }
            const { year, course_code } = subjectResult[0];

            const studentsQuery = `
                SELECT * FROM students WHERE year = ? AND course_code = ?
            `;
            const [studentsResult] = await this.pool.query(studentsQuery, [year, course_code]);
            return studentsResult;
        } catch (error) {
            console.error('Error retrieving students for subject:', error);
            throw error;
        }
    }

    async searchEmplyees(searchString) {
        let query = `
            SELECT * FROM employees
            WHERE first_name LIKE CONCAT('%', ? COLLATE utf8mb4_unicode_ci, '%') 
            OR last_name LIKE CONCAT('%', ? COLLATE utf8mb4_unicode_ci, '%')
            ORDER BY last_name, first_name;
        `;

        try {
            const [results] = await this.pool.query(query, [searchString, searchString]);
            return results;
        } catch (error) {
            console.error('Error searching for emplyees:', error);
            throw error;
        }
    }

    async searchProfessors(searchString) {
        let query = `
            SELECT id, first_name, last_name, email, role, gender
            FROM employees
            WHERE (role = 0 OR role = 1 OR role = 2)
            AND (
                first_name LIKE CONCAT('%', ?, '%') COLLATE utf8mb4_unicode_ci
                OR last_name LIKE CONCAT('%', ?, '%') COLLATE utf8mb4_unicode_ci
            )
            ORDER BY last_name, first_name LIMIT 10;
        `;

        try {
            const [results] = await this.pool.query(query, [searchString, searchString]);
            return results;
        } catch (error) {
            console.error('Error searching for professors:', error);
            throw error;
        }
    }

    async assignEmployeeToSubject(employee_id, subject_id) {
        const insertQuery = `
            INSERT INTO employee_subjects (employee_id, subject_id)
            VALUES (?, ?)
        `;
        try {
            await this.pool.query(insertQuery, [employee_id, subject_id]);
            return true;
        } catch (error) {
            console.error('Error assigning employee to subject:', error);
            return false;
        }
    }

    async removeEmployeeFromSubject(employeeId, subjectId) {
        const query = `
            DELETE FROM employee_subjects
            WHERE employee_id = ? AND subject_id = ?;
        `;
        try {
            const [result] = await this.pool.query(query, [employeeId, subjectId]);
            return result;
        } catch (error) {
            console.error('Failed to remove employee from subject:', error);
            throw error;
        }
    };

    async getSubjectsForEmployee(employee_id) {
        const query = `
            (
                SELECT s.*, c.name as course_name
                FROM subjects s
                JOIN courses c ON s.course_code = c.code
                INNER JOIN employee_subjects es ON s.id = es.subject_id
                WHERE es.employee_id = ?
            )
            UNION DISTINCT
            (
                SELECT s.*, c.name as course_name
                FROM subjects s
                JOIN courses c ON s.course_code = c.code
                WHERE s.professor_id = ?
            )
            ORDER BY name;
        `;

        try {
            const [results] = await this.pool.query(query, [employee_id, employee_id]);
            return results;
        } catch (error) {
            console.error('Error retrieving subjects for employee:', error);
            throw error;
        }
    }

    async getEmployeesForSubject(subjectId) {
        const query = `
            SELECT e.*
            FROM employees e
            JOIN employee_subjects es ON es.employee_id = e.id
            WHERE es.subject_id = ?
            UNION
            SELECT e.*
            FROM employees e
            JOIN subjects s ON s.professor_id = e.id
            WHERE s.id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [subjectId, subjectId]);
            return results;
        } catch (error) {
            console.error('Error retrieving employees for subject:', error);
            throw error;
        }
    }

    async subjectCodeExists(code) {
        const query = 'SELECT 1 FROM subjects WHERE code = ?';
        try {
            const [results] = await this.pool.query(query, [code]);
            return results.length > 0;
        } catch (error) {
            throw error;
        }
    }

    async addSubject(name, code, professorId, courseCode, year) {
        const insertQuery = `
            INSERT INTO subjects (name, code, professor_id, course_code, year)
            VALUES (?, ?, ?, ?, ?)
        `;
        try {
            await this.pool.query(insertQuery, [name, code, professorId, courseCode, year]);
        } catch (error) {
            throw error;
        }
    }

    async getSubjectById(id) {
        const query = `
            SELECT subjects.*, employees.first_name AS professor_first_name, employees.last_name AS professor_last_name, courses.name AS course_name
            FROM subjects
            JOIN employees ON subjects.professor_id = employees.id
            JOIN courses ON subjects.course_code = courses.code
            WHERE subjects.id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error retrieving subject by ID:', error);
            throw error;
        }
    }

    async updateSubject(subjectId, updateData) {
        let query = 'UPDATE subjects SET ';
        const queryParams = [];
        const setParts = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (['name', 'code', 'professor_id', 'year', 'course_code'].includes(key)) {
                setParts.push(`${key} = ?`);
                queryParams.push(value);
            } else {
                console.log(`Unexpected or invalid field: ${key}`);
            }
        }

        if (setParts.length === 0) {
            throw new Error('No valid fields provided for update.');
        }

        query += setParts.join(', ') + ' WHERE id = ?';
        queryParams.push(subjectId);

        try {
            const [result] = await this.pool.query(query, queryParams);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating subject:', error);
            throw error;
        }
    }

    async professorExists(professorId) {
        const query = 'SELECT * FROM employees WHERE id = ? AND role IN (0, 1)';
        try {
            const [results] = await this.pool.query(query, [professorId]);
            return results.length > 0;
        } catch (error) {
            throw error;
        }
    }

    async searchSubjects(searchString, courseCode = null, year = null) {
        let query = `
            SELECT subjects.*, courses.name AS course_name
            FROM subjects
            JOIN courses ON subjects.course_code = courses.code
            WHERE (
                LOWER(subjects.name) LIKE LOWER(CONCAT('%', ?, '%')) 
                OR LOWER(subjects.code) LIKE LOWER(CONCAT('%', ?, '%'))
            )
        `;
        const params = [searchString, searchString];

        if (courseCode) {
            query += ' AND subjects.course_code = ?';
            params.push(courseCode);
        }

        if (year) {
            query += ' AND subjects.year = ?';
            params.push(parseInt(year, 10));
        }

        query += ' ORDER BY subjects.name';

        try {
            const [results] = await this.pool.query(query, params);
            return results;
        } catch (error) {
            console.error('Error searching for subjects:', error);
            throw error;
        }
    }

    async createLogEntry(employeeId, fullName, message, severity, logType, ip, userAgent) {
        const query = `
            INSERT INTO system_activity_logs (employee_id, employee, message, severity, log_type, ip, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            await this.pool.query(query, [employeeId, fullName, message, severity, logType, ip, userAgent]);
        } catch (error) {
            console.error('Error creating log entry:', error);
            throw error;
        }
    }

    async getLogs({ employeeId = null, severity = null, startDate = null, endDate = null, offset = 0, limit = 15 }) {
        let conditions = [];
        const params = [];

        if (employeeId) {
            conditions.push("employee_id = ?");
            params.push(employeeId);
        }
        if (severity) {
            conditions.push("severity = ?");
            params.push(severity);
        }
        if (startDate) {
            conditions.push("created_at >= ?");
            params.push(startDate);
        }
        if (endDate) {
            conditions.push("created_at <= ?");
            params.push(endDate);
        }

        const conditionString = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const query = `
            SELECT * FROM system_activity_logs
            ${conditionString}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit + 1, offset);

        try {
            const [results] = await this.pool.query(query, params);
            return results;
        } catch (error) {
            console.error('Error retrieving logs:', error);
            throw error;
        }
    }

    async addNewTest(subjectId, name, test_no, employee_id, total_tasks, total_tests, total_points) {
        try {
            const insertQuery = `INSERT INTO tests (subject_id, name, test_no, initial_students, final_students, status, employee_id, total_tasks, total_tests, total_points, tasks) VALUES (?, ?, ?, NULL, NULL, 'DODATA_KONFIGURACIJA', ?, ?, ?, ?, NULL)`;
            await this.pool.query(insertQuery, [subjectId, name, test_no, employee_id, total_tasks, total_tests, total_points]);

            const selectQuery = `SELECT id AS testId FROM tests WHERE subject_id = ? ORDER BY id DESC LIMIT 1`;
            const [selectResult] = await this.pool.query(selectQuery, [subjectId]);

            if (selectResult.length === 0) {
                throw new Error("Failed to retrieve the last inserted test ID.");
            }

            const testId = selectResult[0].testId;

            return testId;
        } catch (error) {
            console.error('Error while adding test:', error);
            throw error;
        }
    }

    async getStudentsByIndexes(indexes) {
        if (indexes.length === 0) {
            return [];
        }
        
        const placeholders = indexes.map(() => '?').join(',');
        const query = `
            SELECT * FROM students
            WHERE index_number IN (${placeholders})
        `;
    
        try {
            const [results] = await this.pool.query(query, indexes);
            return results;
        } catch (error) {
            console.error('Error retrieving students by indexes:', error);
            throw error;
        }
    }
    
    async getStudentIdsByIndexes(indexes) {
        const query = `
            SELECT id, index_number FROM students
            WHERE index_number IN (?)
        `;
        try {
            const [results] = await this.pool.query(query, [indexes]);
            return results;
        } catch (error) {
            console.error('Error retrieving student IDs by indexes:', error);
            throw error;
        }
    }

    async addNewTestConfig(employee_id, subject_id, name, test_no) {
        try {
            const insertQuery = `INSERT INTO test_configs (employee_id, subject_id, name, status, test_configs, test_no) VALUES (?, ?, ?, 'KREIRAN', '[]', ?)`;
            await this.pool.query(insertQuery, [employee_id, subject_id, name, test_no]);

            const selectQuery = `SELECT id AS configId FROM test_configs WHERE employee_id = ? ORDER BY id DESC LIMIT 1`;
            const [selectResult] = await this.pool.query(selectQuery, [employee_id]);

            if (selectResult.length === 0) {
                throw new Error("Failed to retrieve the last inserted test configuration ID.");
            }

            const configId = selectResult[0].configId;

            return configId;
        } catch (error) {
            console.error('Error while adding test configuration:', error);
            throw error;
        }
    }

    async getTestConfigById(configId) {
        const query = `
            SELECT id, employee_id, test_configs, status, test_no, name
            FROM test_configs
            WHERE id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [configId]);
            if (results.length > 0) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error retrieving test configuration by ID:', error);
            throw error;
        }
    }


    async updateTestConfigStatus(configId, newStatus) {
        const query = 'UPDATE test_configs SET status = ? WHERE id = ?';
        try {
            const [result] = await this.pool.query(query, [newStatus, configId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating test configuration status:', error);
            throw error;
        }
    }

    async updateTestConfigs(configId, updateData) {
        const query = 'UPDATE test_configs SET test_configs = ? WHERE id = ?';
        try {
            const [result] = await this.pool.query(query, [updateData, configId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating test configuration status:', error);
            throw error;
        }
    }

    async deleteTestConfigById(configId) {
        const deleteQuery = 'DELETE FROM test_configs WHERE id = ?';
        try {
            await this.pool.query(deleteQuery, [configId]);
        } catch (error) {
            throw error;
        }
    }

    async getTestConfigsForSubject(subjectId) {
        const query = `
            SELECT * FROM test_configs
            WHERE subject_id = ?
            AND status = 'ZAVRSEN'
        `;
        try {
            const [results] = await this.pool.query(query, [subjectId]);
            return results;
        } catch (error) {
            console.error('Error retrieving test configurations for subject:', error);
            throw error;
        }
    }

    async getTestById(testId) {
        const query = 'SELECT * FROM tests WHERE id = ?';
        try {
            const [results] = await this.pool.query(query, [testId]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async getTestsByStudentIndex(studentIndex) {
        const studentIndexJSON = JSON.stringify({ "index": studentIndex });
        const query = `
            SELECT DISTINCT t.id, t.initial_students, t.final_students
            FROM tests t
            LEFT JOIN test_gradings tg ON t.id = tg.test_id
            WHERE tg.student_id = ?
            OR JSON_CONTAINS(t.initial_students, ?)
            OR JSON_CONTAINS(t.final_students, ?)
        `;
        try {
            const [results] = await this.pool.query(query, [studentIndex, studentIndexJSON, studentIndexJSON]);
            return results;
        } catch (error) {
            console.error('Error retrieving tests by student index:', error);
            throw error;
        }
    }

    async updateTestField(testId, fieldName, fieldValue) {
        const whitelist = ['initial_students', 'final_students', 'status', 'tasks'];

        if (!whitelist.includes(fieldName)) {
            throw new Error('Invalid field name provided.');
        }

        const query = `UPDATE tests SET ${fieldName} = ? WHERE id = ?`;
        try {
            const [result] = await this.pool.query(query, [fieldValue, testId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating test field:', error);
            throw error;
        }
    }

    async getTestsForSubject(subjectId) {
        const query = 'SELECT * FROM tests WHERE subject_id = ?';
        try {
            const [results] = await this.pool.query(query, [subjectId]);
            return results;
        } catch (error) {
            console.error('Error retrieving tests for subject:', error);
            throw error;
        }
    }

    async deleteTestById(testId) {
        const deleteQuery = 'DELETE FROM tests WHERE id = ?';
        try {
            await this.pool.query(deleteQuery, [testId]);
            return true;
        } catch (error) {
            console.error('Error deleting test:', error);
            throw error;
        }
    }


    async addNewTestGrading(studentId, testId, employeeId, total_points, status) {
        const deleteQuery = `
            DELETE FROM test_gradings
            WHERE student_id = ? AND test_id = ?
        `;
        const insertQuery = `
            INSERT INTO test_gradings (student_id, test_id, employee_id, total_points, gradings, status)
            VALUES (?, ?, ?, ?, NULL, ?)
        `;

        try {
            await this.pool.query(deleteQuery, [studentId, testId]);

            await this.pool.query(insertQuery, [studentId, testId, employeeId, total_points, status]);
        } catch (error) {
            console.error('Error handling test grading:', error);
            throw error;
        }
    }

    async updateFinalTestGrading(testId, studentId, total_points, gradings, status, employee_id) {
        const selectQuery = `
            SELECT COUNT(1) AS cnt
            FROM test_gradings
            WHERE test_id = ? AND student_id = ?
        `;

        const insertQuery = `
            INSERT INTO test_gradings (test_id, employee_id, student_id, total_points, gradings, status)
            VALUES (?, NULL, ?, ?, ?, ?)
        `;

        const updateQuery = `
            UPDATE test_gradings
            SET total_points = ?, gradings = ?, status = ?, employee_id = ?
            WHERE test_id = ? AND student_id = ?
        `;

        try {
            const [results] = await this.pool.query(selectQuery, [testId, studentId]);
            if (results[0].cnt > 0) {
                await this.pool.query(updateQuery, [total_points, gradings, status, employee_id, testId, studentId]);
            } else {
                await this.pool.query(insertQuery, [testId, studentId, total_points, gradings, status]);
            }
        } catch (error) {
            console.error('Error updating final test grading:', error);
            throw error;
        }
    }

    async deleteTestGrading(testId, studentId) {
        const query = `
            DELETE FROM test_gradings
            WHERE test_id = ? AND student_id = ?
        `;
        try {
            const [result] = await this.pool.query(query, [testId, studentId]);
            return result.affectedRows > 0
        } catch (error) {
            console.error('Error deleting test grading:', error);
        }
    }

    async deleteTestGradingByStudentId(testId, studentId) {
        const query = `
            DELETE FROM test_gradings
            WHERE test_id = ? AND student_id = ?
        `;
        try {
            const [result] = await this.pool.query(query, [testId, studentId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting test grading for student:', error);
            throw error;
        }
    }

    async getTestGradings(testId) {
        const query = `
            SELECT tg.*, s.index_number
            FROM test_gradings tg
            JOIN students s ON tg.student_id = s.id
            WHERE tg.test_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [testId]);
            return results;
        } catch (error) {
            console.error('Error retrieving test gradings with student indexes:', error);
            throw error;
        }
    }

    async getTestGradingsReport(testId) {
        const query = `
            SELECT tg.*, s.index_number, e.first_name, e.last_name
            FROM test_gradings tg
            JOIN students s ON tg.student_id = s.id
            JOIN employees e ON tg.employee_id = e.id
            WHERE tg.test_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [testId]);
            return results;
        } catch (error) {
            console.error('Error retrieving test gradings with student indexes:', error);
            throw error;
        }
    }


    async getTestGradingForStudent(testId, studentId) {
        const query = `
            SELECT * FROM test_gradings
            WHERE test_id = ?
            AND student_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [parseInt(testId), parseInt(studentId)]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error retrieving test grading for student:', error);
            throw error;
        }
    }

    async getTestResultsByStudentId(studentId) {
        const query = `
            SELECT 
                t.id, 
                t.name AS test_name, 
                t.created_at, 
                t.total_points AS total_possible_points, 
                tg.total_points AS score, 
                tg.employee_id,
                s.name AS subject_name,
                s.code AS subject_code,
                s.year AS subject_year
            FROM tests t
            JOIN test_gradings tg ON t.id = tg.test_id
            JOIN employees e ON tg.employee_id = e.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE tg.student_id = ?
            ORDER BY t.created_at DESC;
        `;
        try {
            const [results] = await this.pool.query(query, [studentId]);
            return results;
        } catch (error) {
            console.error('Error retrieving test results for student:', error);
            throw error;
        }
    }

    async isTestRunningForStudent(studentId, testId) {
        const query = `
            SELECT COUNT(*) AS count
            FROM test_gradings
            WHERE student_id = ? AND status = 'TESTIRANJE' AND test_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [studentId, testId]);
            console.log(results[0].count > 0)
            console.log(results)
            return results[0].count > 0;
        } catch (error) {
            console.error('Error checking for running tests:', error);
            throw error;
        }
    }

    async areTestsRunningForStudents(studentIds, testId) {
        const placeholders = studentIds.map(() => '?').join(',');
        const query = `
            SELECT COUNT(*) AS count
            FROM test_gradings
            WHERE student_id IN (${studentIds}) AND status = 'TESTIRANJE' AND test_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, testId);
            return results[0].count > 0;
        } catch (error) {
            console.error('Error checking for running tests for multiple students:', error);
            throw error;
        }
    }

    async addNewAutoTestResult(studentId, testId, employeeId, result, taskNo, testNo) {
        const insertQuery = `
            INSERT INTO auto_test_results (student_id, test_id, employee_id, result, test_no, task_no)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            await this.pool.query(insertQuery, [studentId, testId, employeeId, result, testNo, taskNo]);
        } catch (error) {
            console.error('Error adding auto test result:', error);
            throw error;
        }
    }

    async getAutoTestResultsForStudent(studentId, testId) {
        const query = `
            SELECT * FROM auto_test_results
            WHERE student_id = ?
            AND test_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [studentId, testId]);
            return results;
        } catch (error) {
            console.error('Error retrieving auto test results for student:', error);
            throw error;
        }
    }

    async clearAutoTestResultsForStudent(studentId, testId) {
        const query = `
            DELETE FROM auto_test_results
            WHERE student_id = ?
            AND test_id = ?
        `;
        try {
            await this.pool.query(query, [studentId, testId]);
        } catch (error) {
            console.error('Error clearing auto test results for student:', error);
            throw error;
        }
    }

    async checkEmployeeSubjectRelation(employeeId, subjectId) {
        const query = `
            SELECT 1 FROM employee_subjects
            WHERE employee_id = ? AND subject_id = ?
            UNION
            SELECT 1 FROM subjects
            WHERE id = ? AND professor_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [employeeId, subjectId, subjectId, employeeId]);
            return results.length > 0;
        } catch (error) {
            console.error('Error checking employee-subject relation:', error);
            throw error;
        }
    }

    async getVariations(testId, taskNo) {
        const query = `
            SELECT id, name
            FROM variations
            WHERE test_id = ? AND task_no = ?
        `;
        try {
            const [results] = await this.pool.query(query, [testId, taskNo]);
            return results;
        } catch (error) {
            console.error('Error retrieving variations:', error);
            throw error;
        }
    }

    async getVariationById(id) {
        const query = `
            SELECT id, test_id, task_no, name
            FROM variations
            WHERE id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error retrieving variation by ID:', error);
            throw error;
        }
    }

    async addVariation(testId, taskNo, variationName) {
        const query = `
            INSERT INTO variations (test_id, task_no, name)
            VALUES (?, ?, ?)
        `;
        try {
            const [result] = await this.pool.query(query, [testId, taskNo, variationName]);
            return result.insertId;
        } catch (error) {
            console.error('Error adding variation to the database:', error);
            return null;
        }
    }

    async removeVariationById(id) {
        const query = `
            DELETE FROM variations
            WHERE id = ?
        `;
        try {
            const [result] = await this.pool.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error removing variation:', error);
            throw error;
        }
    }

    async variationExists(testId, taskNo, variationName) {
        const query = `
            SELECT 1
            FROM variations
            WHERE test_id = ? AND task_no = ? AND name = ?
        `;
        try {
            const [results] = await this.pool.query(query, [testId, taskNo, variationName]);
            return results.length > 0;
        } catch (error) {
            console.error('Error checking variation existence:', error);
            return false;
        }
    }

    async addNewVariationAutoTestResult(variationId, result, testNo) {
        const insertQuery = `
            INSERT INTO variation_test_results (variation_id, result, test_no)
            VALUES (?, ?, ?)
        `;
        try {
            await this.pool.query(insertQuery, [variationId, result, testNo]);
        } catch (error) {
            console.error('Error adding variation test result:', error);
            throw error;
        }
    }

    async addNewVariationFinalResult(variationId, total_points, status) {
        const deleteQuery = `
            DELETE FROM final_variation_results
            WHERE variation_id = ?
        `;
        const insertQuery = `
            INSERT INTO final_variation_results (variation_id, total_points, status, results)
            VALUES (?, ?, ?, NULL)
        `;

        try {
            await this.pool.query(deleteQuery, [variationId]);
            await this.pool.query(insertQuery, [variationId, total_points, status]);
        } catch (error) {
            console.error('Error adding final variation result:', error);
            throw error;
        }
    }

    async updateFinalVariationResults(variationId, variationResults, totalPoints, status) {
        const selectQuery = `
            SELECT COUNT(1) as cnt
            FROM final_variation_results
            WHERE variation_id = ?`;

        const updateQuery = `
            UPDATE final_variation_results
            SET results = ?, total_points = ?, status = ?
            WHERE variation_id = ?
        `;

        const insertQuery = `
            INSERT INTO final_variation_results (variation_id, results, total_points, status)
            VALUES (?, ?, ?, ?)
        `;

        try {
            const [results] = await this.pool.query(selectQuery, [variationId]);
            if (results[0].cnt > 0) {
                await this.pool.query(updateQuery, [variationResults, totalPoints, status, variationId]);
            } else {
                await this.pool.query(insertQuery, [variationId, variationResults, totalPoints, status]);
            }
        } catch (error) {
            console.error('Error moving variation results:', error);
            throw error;
        }
    }

    async clearVariationAutoTestResults(variationId) {
        const query = `
            DELETE FROM variation_test_results
            WHERE variation_id = ?
        `;
        try {
            await this.pool.query(query, [variationId]);
        } catch (error) {
            console.error('Error clearing variation test results:', error);
            throw error;
        }
    }

    async getFinalVariationResults(variationId) {
        const query = `
            SELECT * FROM final_variation_results
            WHERE variation_id = ?
        `;
        try {
            const [results] = await this.pool.query(query, [variationId]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error retrieving final variation results:', error);
            throw error;
        }
    }

    async isTestRunningForVariation(variationId) {
        const query = `
            SELECT COUNT(*) AS count
            FROM final_variation_results
            WHERE variation_id = ? AND status = 'TESTIRANJE'
        `;
        try {
            const [results] = await this.pool.query(query, [variationId]);
            return results[0].count > 0;
        } catch (error) {
            console.error('Error checking for running variation test:', error);
            throw error;
        }
    }

    async getResultsForVariation(variationId) {
        const query = `
            SELECT * FROM variation_test_results
            WHERE variation_id = ?
        `;
        try {
            const [rows] = await this.pool.query(query, [variationId]);
            return rows.length > 0 ? rows : [];
        } catch (error) {
            console.error('Error retrieving results for variation:', error);
            throw error;
        }
    }
}

module.exports = Database;
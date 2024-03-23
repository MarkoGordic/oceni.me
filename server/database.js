const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'gordic',
    password: 'NadjaImasNajlepseOciNaSvetu!',
    database: 'oceni.me'
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

        const createeemployeesTable = `
            CREATE TABLE IF NOT EXISTS employees (
                id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                first_name      VARCHAR(100) NOT NULL,
                last_name       VARCHAR(100) NOT NULL,
                password        VARCHAR(100) NOT NULL,
                email           VARCHAR(100) NOT NULL UNIQUE,
                last_login_ip   VARCHAR(15),
                role            TINYINT
            );
        `;

        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                year YEAR NOT NULL,
                index_number VARCHAR(20) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                course_code VARCHAR(10),
                FOREIGN KEY (course_code) REFERENCES courses(code)
                    ON DELETE SET NULL ON UPDATE CASCADE
            );
        `;

        const createCoursesTable = `
            CREATE TABLE IF NOT EXISTS courses (
                code VARCHAR(10) NOT NULL PRIMARY KEY,
                name VARCHAR(200) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const populateCoursesTable = `
            INSERT INTO courses (name, code) VALUES
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
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
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

        try {
            await this.pool.execute(createeemployeesTable);
            console.info("[INFO] : Employees table created successfully.");
            await this.pool.execute(createCoursesTable);
            console.info("[INFO] : Courses table created successfully.");
            //await this.pool.execute(populateCoursesTable);
            //console.info("[INFO] : Courses table populated successfully.");
            await this.pool.execute(createStudentsTable);
            console.info("[INFO] : Students table created successfully.");
            await this.pool.execute(createSubjectsTable);
            console.info("[INFO] : Subjects table created successfully.");
            await this.pool.execute(createSubjectEmployeesTable);
            console.info("[INFO] : Employee-Subjects table created successfully.");
            await this.pool.execute(createSystemActivityLogsTable);
            console.info("[INFO] : System activity logs table created successfully.");
        } catch (err) {
            console.error("[ERROR] : Error while running SQL.", err);
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
        const query = 'SELECT first_name, last_name, email, id FROM employees WHERE id = ?';
        try {
            const [results] = await this.pool.query(query, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
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

    async registerNewEmployee(firstName, lastName, email, hashedPassword, role) {
        const query = 'INSERT INTO employees (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
        try {
            const [result] = await this.pool.query(query, [firstName, lastName, email, hashedPassword, role]);
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
    

    async updateEmployeeInfo(userId, updateFields) {
        let query = `UPDATE employees SET `;
        let queryParams = [];
        let setParts = [];
        
        if (updateFields.firstName) {
            setParts.push(`first_name = ?`);
            queryParams.push(updateFields.firstName);
        }
        if (updateFields.lastName) {
            setParts.push(`last_name = ?`);
            queryParams.push(updateFields.lastName);
        }
        if (updateFields.email) {
            setParts.push(`email = ?`);
            queryParams.push(updateFields.email);
        }
    
        if (setParts.length === 0) {
            throw new Error("No fields provided for update");
        }
    
        query += setParts.join(', ') + ` WHERE id = ?`;
        queryParams.push(userId);
    
        try {
            await this.pool.query(query, queryParams);
        } catch (error) {
            console.error('Error updating employee info:', error);
            throw error;
        }
    }
    

    async addStudent(first_name, last_name, index_number, year, email, password, course_code) {
        const insertQuery = `
            INSERT INTO students (first_name, last_name, index_number, year, email, password, course_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            await this.pool.query(insertQuery, [first_name, last_name, index_number, year, email, password, course_code]);
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

    async getStudentById(id) {
        const query = 'SELECT first_name, last_name, email, index_number, year, course_code, id FROM students WHERE id = ?';
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

    async searchStudents(searchString, courseCode = null) {
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

        try {
            const [results] = await this.pool.query(query, params);
            if (results.length === 0) {
                return [];
            }
    
            const courseCodes = [...new Set(results.map(student => student.course_code))];
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
        } catch (error) {
            console.error('Error searching for students:', error);
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
            SELECT id, first_name, last_name, email, role
            FROM employees
            WHERE (role = 0 OR role = 1)
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
            throw error;
        }
    }

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

    async getLogs(employeeId = null, offset = 0, limit = 15) {
        let query;
        const params = [];
    
        if (employeeId) {
            query = `
                SELECT * FROM system_activity_logs
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            params.push(employeeId, limit, offset);
        } else {
            query = `
                SELECT * FROM system_activity_logs
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            params.push(limit, offset);
        }
    
        try {
            const [results] = await this.pool.query(query, params);
            return results;
        } catch (error) {
            console.error('Error retrieving logs:', error);
            throw error;
        }
    }
    
    
}

module.exports = Database;
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

        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                first_name      VARCHAR(100) NOT NULL,
                last_name       VARCHAR(100) NOT NULL,
                password        VARCHAR(100) NOT NULL,
                email           VARCHAR(100) NOT NULL UNIQUE,
                last_login_ip   VARCHAR(15),
                admin           TINYINT
            );
        `;

        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
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
            );
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

        try {
            await this.pool.execute(createUsersTable);
            console.info("[INFO] : Users table created successfully.");
            await this.pool.execute(createCoursesTable);
            console.info("[INFO] : Courses table created successfully.");
            //await this.pool.execute(populateCoursesTable);
            //console.info("[INFO] : Courses table populated successfully.");
            await this.pool.execute(createStudentsTable);
            console.info("[INFO] : Students table created successfully.");
        } catch (err) {
            console.error("[ERROR] : Error creating users table", err);
        }
    }

    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        try {
            const [results] = await this.pool.query(query, [email]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id) {
        const query = 'SELECT first_name, last_name, email, id FROM users WHERE id = ?';
        try {
            const [results] = await this.pool.query(query, [id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async registerNewUser(firstName, lastName, email, hashedPassword) {
        const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        try {
            await this.pool.query(query, [firstName, lastName, email, hashedPassword]);
        } catch (error) {
            throw error;
        }
    }

    async addStudent(first_name, last_name, index_number, email, password, course_code) {
        const query = `
            INSERT INTO students (first_name, last_name, index_number, email, password, course_code)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
            await this.pool.query(query, [first_name, last_name, index_number, email, password, course_code]);
        } catch (error) {
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
            WHERE (index_number LIKE CONCAT('%', ?, '%') 
            OR first_name LIKE CONCAT('%', ?, '%') 
            OR last_name LIKE CONCAT('%', ?, '%'))
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
                course_name: courseCodeToNameMap[student.course_code] || 'Unknown'
            }));
    
            return modifiedResults;
        } catch (error) {
            console.error('Error searching for students:', error);
            throw error;
        }
    }
    
}

module.exports = Database;
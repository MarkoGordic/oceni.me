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
                profile_image   VARCHAR(255),
                last_login_ip   VARCHAR(15),
                admin           TINYINT
            );
        `;

        try {
            await this.pool.execute(createUsersTable);
            console.info("[INFO] : Users table created successfully.");
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
        const query = 'SELECT first_name, last_name, email, profile_image, id FROM users WHERE id = ?';
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
}

module.exports = Database;
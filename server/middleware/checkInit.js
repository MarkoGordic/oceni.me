const database = require('../database');
const db = new database();

const checkInit = async (req, res, next) => {
    try {
        const initStatus = await db.checkIsDBInitialized();
        console.log('initStatus:', initStatus);

        const isInit = initStatus.length > 0 ? initStatus[0].config_value : null;

        if (isInit !== null) {
            console.log('Database is already initialized.');
            return res.status(403).send('Unauthorized - Initialization already completed.');
        }

        next();
    } catch (error) {
        console.error('Error verifying init status:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = checkInit;

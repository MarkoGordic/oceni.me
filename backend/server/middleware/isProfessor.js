const database = require('../database');
const db = new database();

const checkIsProfessor = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(403).send('Access denied. No user ID found in session.');
        }

        const user = await db.getEmployeeById(userId);
        
        if (!user) {
            return res.status(404).send('User not found.');
        }

        if (user.role > 2) {
            return res.status(403).send('Access denied. You are not authorized to access this resource.');
        }

        next();
    } catch (error) {
        console.error('Error verifying professor role:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = checkIsProfessor;

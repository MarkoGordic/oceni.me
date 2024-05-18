const database = require('../database');
const db = new database();

const checkAuthForAutoTest = async (req, res, next) => {
    const userId = req.session.userId;
    const { testId } = req.body;

    if (!userId) {
        return res.status(401).send('Unauthorized: No user session found.');
    }

    try {
        const testDetails = await db.getTestById(testId);
        if (!testDetails) {
            return res.status(404).send('Test not found.');
        }

        const subjectId = testDetails.subject_id;
        const isEmployeeForSubject = await db.checkEmployeeSubjectRelation(userId, subjectId);

        if (!isEmployeeForSubject) {
            return res.status(403).send('Unauthorized: You do not have permission to perform this action.');
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).send('Internal server error while checking authorization.');
    }
};

module.exports = checkAuthForAutoTest;

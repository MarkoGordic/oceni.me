const checkAuthForSubjects = async (req, res, next) => {
    const userId = req.session.userId;
    const subjectId = req.params.id || req.body.subject_id;

    if (!userId) {
        return res.status(401).send('Unauthorized: No user session found.');
    }

    try {
        const user = await db.getEmployeeById(userId);
        if (!user) {
            return res.status(404).send('User not found.');
        }
        
        if (user.role === 0) {
            return next();
        }

        const subject = await db.getSubjectById(subjectId);
        if (subject && subject.professor_id === userId) {
            return next();
        }

        res.status(403).send('Unauthorized: You do not have permission to perform this action.');
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).send('Internal server error while checking authorization.');
    }
};

module.exports = checkAuthForSubjects;
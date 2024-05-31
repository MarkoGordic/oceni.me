import React from 'react';
import './currentStudentInfo.css';

function CurrentStudentInfo({ student, currentPoints, maxPoints, pc }) {
    if (!student) {
        return <div className='loader'></div>;
    }

    return (
        <div className="review-student-card">
            <div className="review-student-card-info">
                <img className='review-student-card-avatar' src={`http://localhost:8000/student_pfp/${student.id}.jpg`} alt="Student's Avatar" />
                <div className='review-student-card-info-details'>
                    <p className='review-student-card-full-name'>{student.first_name} {student.last_name} - {student.index_number} - {pc}</p>
                    <p className='review-student-card-email'>{student.email}</p>
                </div>
                <div className='review-student-card-actions'>
                    <p className='review-student-card-points'>{currentPoints || 0}/{maxPoints || 0}</p>
                </div>
            </div>
        </div>
    );
}

export default CurrentStudentInfo;

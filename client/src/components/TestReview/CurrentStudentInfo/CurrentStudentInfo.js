import React from 'react';
import './currentStudentInfo.css';

function CurrentStudentInfo({ student, currentPoints, maxPoints }) {
    if (!student) {
        return <div className='loader'></div>;
    }

    return (
        <div className="review-student-card">
            <div className="review-student-card-info">
                <img className='review-student-card-avatar' src={`http://localhost:8000/student_pfp/${student.id}.jpg`} alt="Student's Avatar" />
                <div className='review-student-card-info-details'>
                    <p className='review-student-card-full-name'>{student.first_name} {student.last_name}</p>
                    <p className='review-student-card-email'>{student.email}</p>
                </div>
                <div className='review-student-card-actions'>
                    <p className='review-student-card-points'>{currentPoints || 0}/{maxPoints || 0}</p>
                    <button className='review-student-card-button'>OCENI</button>
                </div>
            </div>
        </div>
    );
}

export default CurrentStudentInfo;

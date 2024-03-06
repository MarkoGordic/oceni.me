import React from 'react';
import './studentCard.css';

function StudentCard(props) {
    const { profile_image, name, email, course, onClick } = props;

    return (
        <div className="student-card" onClick={onClick}>
            <div className="student-card-info">
                <img className='student-card-avatar' src={profile_image} alt="Student's Avatar" />
                <div className='student-card-info-details'>
                    <p className='student-card-full-name'>{name}</p>
                    <p className='student-card-email'>{email}</p>
                    <p className='student-card-course'>{course}</p>
                </div>
            </div>
        </div>
    );
}


export default StudentCard;
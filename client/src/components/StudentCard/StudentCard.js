import React from 'react';
import './studentCard.css';

function StudentCard(props) {
    return (
        <div className="student-card">
            <div className="student-card-info">
                <img className='student-card-avatar' src={props.profile_image} alt="Fotografija studenta" />
                <div className='student-card-info-details'>
                    <p className='student-card-full-name'>{props.name}</p>
                    <p className='student-card-email'>{props.email}</p>
                    <p className='student-card-course'>{props.course}</p>
                </div>
            </div>
        </div>
    );
}

export default StudentCard;
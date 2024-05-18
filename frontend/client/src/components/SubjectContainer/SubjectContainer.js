import React from 'react';
import './subjectContainer.css';

function SubjectContainer({ subject, onClick }) {
    const { name, code, course_name, professor_id, year } = subject;
    
    return (
        <div className='subject-wrap' onClick={onClick}>
            <div className='subject-professor'>
                <img src={'http://localhost:8000/user_pfp/' + professor_id + '.jpg'} />
            </div>
            <div className='subject-data'>
                <div className='subject-name-and-employees'>
                    <p className='subject-name'>{name} - {code}</p>
                </div>
                <div className='course-name-and-generation'>
                    <p>{`${course_name} - ${year}`}</p>
                </div>
            </div>
        </div>
    );
}

export default SubjectContainer;

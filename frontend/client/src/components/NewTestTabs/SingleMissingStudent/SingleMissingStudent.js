import React from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "./singleMissingStudent.css";

function SingleMissingStudent({ student, addStudent}) {
    const { index, pc, first_name, last_name } = student;

    return (
        <div className='missing-student-card'>
            <img src={`http://localhost:8000/student_pfp/default.png`} alt='Student' />
            <div className='missing-student-card-info'>
                <p className='missing-student-card-index'>{first_name} {last_name} - {index}</p>
                <p className='missing-student-card-pc'>{pc}</p>
            </div>
            
            <div className='missing-student-card-actions'>
                <button className='missing-student-card-action' onClick={() => addStudent(student)}><i className="fi fi-rr-plus"></i></button>
            </div>
        </div>
    );
}

export default SingleMissingStudent;
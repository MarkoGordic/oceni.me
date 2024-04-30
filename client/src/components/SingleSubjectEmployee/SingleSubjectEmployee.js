import React from "react";
import { toast } from "react-toastify";

const SingleSubjectEmployee = ({ employee, subjectId, professorID, onRemoveSuccess }) => {
    const roleOptions = [
        { value: 0, label: 'Dekan'},
        { value: 1, label: 'Profesor' },
        { value: 2, label: 'Asistent' },
        { value: 3, label: 'Demonstrator' },
    ];

    const handleRemoveClick = async () => {
        try {
            const response = await fetch('http://localhost:8000/subjects/remove_employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employeeId: employee.id, subjectId: parseInt(subjectId) }),
                credentials: 'include',
            });
            if (response.ok) {
                toast.success(`Zaposleni ${employee.first_name} ${employee.last_name} je uklonjen sa predmeta.`);
                onRemoveSuccess(employee.id);
            } else {
                toast.error('Greška pri uklanjanju zaposlenog sa predmeta!');
            }
        } catch (error) {
            console.error('Error removing employee from subject:', error);
            toast.error('Došlo je do neočekivane greške prilikom uklanjanja zaposlenog sa predmeta.');
        }
    };

    return (
        <div className='subject-manage-employee'>
            <img src={`http://localhost:8000/user_pfp/${employee.id}.jpg`} alt="Employee profile" className="subject-manage-employee-image"/>
            <div className='subject-manage-employee-details'>
                <p className='subject-manage-employee-name'>{employee.first_name} {employee.last_name}</p>
                <p className='subject-manage-employee-role'>{roleOptions[employee.role].label}</p>
            </div>

            <div className='subject-manage-employee-actions'>
                {employee.id !== professorID && (
                    <button className='subject-manage-employee-action' onClick={handleRemoveClick}>
                        <i className="fi fi-rr-remove-user"></i>
                    </button>
                )}
            </div>
        </div>
    );
}

export default SingleSubjectEmployee;

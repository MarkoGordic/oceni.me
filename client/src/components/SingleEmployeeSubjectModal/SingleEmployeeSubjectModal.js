import React from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SingleEmployeeSubjectModal = ({ employee, subjectId, onAddSuccess }) => {
    const roleOptions = [
        { value: 0, label: 'Dekan'},
        { value: 1, label: 'Profesor' },
        { value: 2, label: 'Asistent' },
        { value: 3, label: 'Demonstrator' },
    ];

    const handleAddClick = async () => {
        try {
            const response = await fetch('http://localhost:8000/subjects/assign_employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employee_id: employee.id, subject_id: subjectId }),
                credentials: 'include',
            });
            if (response.ok) {
                toast.success(`Zaposleni ${employee.first_name} ${employee.last_name} je dodat na predmet.`);
                onAddSuccess(employee.id); 
            } else {
                toast.error(`Greška pri dodavanju zaposlenog na predmet!`);
            }
        } catch (error) {
            console.error('Error adding employee to subject:', error);
            toast.error("Došlo je do neočekivane greške prilikom dodavanja zaposlenog na predmet.");
        }
    }

    return (
        <div className='subject-single-employee-modal'>
            <ToastContainer theme="dark"/>
            <img src={`http://localhost:8000/user_pfp/${employee.id}.jpg`} alt="Employee profile" className="subject-single-employee-modal-image"/>
            <div className='subject-single-employee-modal-details'>
                <p className='subject-single-employee-modal-name'>{employee.first_name} {employee.last_name}</p>
                <p className='subject-single-employee-modal-role'>{roleOptions[employee.role].label}</p>
            </div>

            <div className='subject-single-employee-modal-actions'>
                <button className='subject-single-employee-modal-action' onClick={handleAddClick}>
                    <i className="fi fi-rr-plus"></i>
                </button>
            </div>
        </div>
    );
}

export default SingleEmployeeSubjectModal;

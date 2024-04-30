import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SingleEmployeeSubjectModal from "../SingleEmployeeSubjectModal/SingleEmployeeSubjectModal";
import "./addSubjectEmployeeModal.css";

function AddSubjectEmployeeModal({ isOpen, onClose, existingEmployees, subjectId, onAddSuccess }) {
    const [searchString, setSearchString] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const roleMap = {
        0: 'Dekan',
        1: 'Profesor',
        2: 'Asistent',
        3: 'Demonstrator',
    };

    const performSearch = async () => {
        try {
            const response = await fetch('http://localhost:8000/employees/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: searchString }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                const filteredData = data.filter(employee => !existingEmployees.includes(employee.id));
                const employeesWithRoleName = filteredData.map(employee => ({
                    ...employee,
                    roleName: roleMap[employee.role],
                }));
                setSearchResults(employeesWithRoleName);
            } else {
                toast.error("Došlo je do neočekivane greške prilikom pretrage zaposlenih.");
            }
        } catch (error) {
            console.error("Error searching employees:", error);
            toast.error("Došlo je do neočekivane greške prilikom pretrage zaposlenih.");
        }
    };

    const handleSearchChange = (event) => {
        setSearchString(event.target.value);
    };

    const handleAddSuccess = (employeeId) => {
        setSearchResults(prevResults => prevResults.filter(emp => emp.id !== employeeId));
        onAddSuccess(employeeId);
    };

    useEffect(() => {
        if (searchString.trim() !== '') {
            performSearch();
        }
    }, [searchString, existingEmployees]);

    if (!isOpen) return null;

    return (
        <div className="add-subject-employee-modal-overlay" onClick={onClose}>
            <div className="add-subject-employee-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Dodavanje novog asistenta</h2>

                <div className="search-bar">
                    <i className="fi fi-rr-search search-icon"></i>
                    <input type="text" className="search-input" placeholder="Pretražite zaposlene unošenjem imena ili prezimena..." onChange={handleSearchChange} />
                </div>

                <div className="add-subject-employee-search-results">
                    {searchResults.map(employee => (
                        <SingleEmployeeSubjectModal key={employee.id} employee={employee} subjectId={subjectId} onAddSuccess={handleAddSuccess} />
                    ))}
                </div>

                <button className="add-subject-employee-complete-button" onClick={onClose}>ZAVRŠI</button>
            </div>
        </div>
    );
}

export default AddSubjectEmployeeModal;

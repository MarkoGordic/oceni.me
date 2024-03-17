import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from "../../components/Sidebar/Sidebar";
import './manageEmployees.css';
import UserCard from '../../components/UserCard/UserCard';
import ModifyEmployeeModal from '../../components/ModifyEmployeeModal/ModifyEmployeeModal';

function ManageEmployees() {
    const [searchString, setSearchString] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [modifyModalOpen, setModifyModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [deletionCount, setDeletionCount] = useState(0);

    const roleMap = {
        0: 'Dekan',
        1: 'Profesor',
        2: 'Asistent',
        3: 'Demonstrator',
    };

    useEffect(() => {
        if (deletionCount > 0) {
            performSearch();
        }
    }, [deletionCount]);

    const handleEmployeeClick = (employeeId) => {
        setSelectedEmployeeId(employeeId);
        setModifyModalOpen(true);
    };

    const handleSearchChange = (event) => {
        setSearchString(event.target.value);
    };

    useEffect(() => {
        if (searchString.trim() !== '') {
            performSearch();
        }
    }, [searchString]);

    const performSearch = async () => {
        try {
            const response = await fetch('http://localhost:8000/employees/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: searchString }),
            });
            if (response.ok) {
                const data = await response.json();
                const employeesWithRoleName = data.map(employee => ({
                    ...employee,
                    roleName: roleMap[employee.role],
                }));
                setSearchResults(employeesWithRoleName);
            } else {
                toast.error("Failed to search employees.");
            }
        } catch (error) {
            console.error("Error searching employees:", error);
            toast.error("Error occurred while searching for employees.");
        }
    };

    return (
        <div className='wrap'>
            <Sidebar />
            <div className='content'>
                <div className="search-bar">
                    <i className="fi fi-rr-search search-icon"></i>
                    <input type="text" className="search-input" placeholder="Pretražite zaposlene unošenjem imena ili prezimena..." onChange={handleSearchChange} />
                </div>

                <button className='new-employee-button'><div className='new-button-content'><i className="fi fi-rs-add"></i> DODAJ ZAPOSLENOG</div></button>

                <div className='users-list-wrap'>
                    {searchResults.length > 0 ? (
                        searchResults.map((employee) => (
                            <UserCard
                                key={employee.id}
                                name={`${employee.first_name} ${employee.last_name}`}
                                email={employee.email}
                                role={employee.roleName}
                                profile_image={'http://localhost:8000/user_pfp/' + employee.id + '.jpg'}
                                onClick={() => handleEmployeeClick(employee.id)}
                            />
                        ))
                    ) : (
                        <p>Nije pronađen ni jedan zaposleni.</p>
                    )}
                </div>

                <ModifyEmployeeModal
                    isOpen={modifyModalOpen}
                    onClose={() => setModifyModalOpen(false)}
                    employeeId={selectedEmployeeId}
                    onEmployeeDeleted={() => setDeletionCount(count => count + 1)}
                />
            </div>
        </div>
    );
}

export default ManageEmployees;
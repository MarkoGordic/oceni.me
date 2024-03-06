import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from "../../components/Sidebar/Sidebar";
import './manageUsers.css';
import UserCard from '../../components/UserCard/UserCard';

function ManageUsers() {
    const [searchString, setSearchString] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const roleMap = {
        0: 'Dekan',
        1: 'Profesor',
        2: 'Asistent'
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
            const response = await fetch('http://localhost:8000/users/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: searchString }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                const employeesWithRoleName = data.map(employees => ({
                    ...employees,
                    roleName: roleMap[employees.role]
                }));
                console.log(employeesWithRoleName);
                setSearchResults(employeesWithRoleName);
            } else {
                console.error("Failed to search assistants.");
            }
        } catch (error) {
            console.error("Error searching assistants:", error);
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

                <div className='users-list-wrap'>
                    {searchResults.length > 0 ? (
                        searchResults.map((employee) => (
                            <UserCard
                                key={employee.id}
                                name={`${employee.first_name} ${employee.last_name}`}
                                email={employee.email}
                                role={employee.roleName}
                                profile_image={process.env.PUBLIC_URL + '/user_pfp/' + employee.id + '.jpg'}
                                
                            />
                        ))
                    ) : (
                        <p>Nije pronađen ni jedan zaposleni.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageUsers;
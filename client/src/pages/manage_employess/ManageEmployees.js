import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from "../../components/Sidebar/Sidebar";
import './manageEmployees.css';
import UserCard from '../../components/UserCard/UserCard';
import ModifyEmployeeModal from '../../components/ModifyEmployeeModal/ModifyEmployeeModal';
import NewEmployeeModal from '../../components/NewEmployeeModal/NewEmployeeModal';

function ManageEmployees() {
    const [searchString, setSearchString] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [modifyModalOpen, setModifyModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [deletionCount, setDeletionCount] = useState(0);
    const [isModalOpen, setModalOpen] = useState(false);
    const [employeeData, setEmployeeData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        profile_image: null,
        role: '',
        gender: '',
    });

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

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

    const handleInputChange = (e) => {
        const { name, value, files, type } = e.target;
        if (type === 'file') {
            setEmployeeData(prevState => ({ ...prevState, profile_image: files[0] }));
        } else {
            setEmployeeData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleRoleSelectChange = selectedOption => {
        setEmployeeData({ ...employeeData, role: selectedOption ? selectedOption.value : '' });
    };

    const handleGenderSelectChange = selectedOption => {
        setEmployeeData({ ...employeeData, gender: selectedOption ? selectedOption.value : '' });
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
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                const employeesWithRoleName = data.map(employee => ({
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

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{10,}$/;
        
        if (!employeeData.role) {
            toast.error("Neuspešno kreiranje zaposlenog. Molimo izaberite poziciju zaposlenog.");
            return;
        }

        if (!emailPattern.test(employeeData.email)) {
            toast.error("Neuspešno kreiranje zaposlenog. Neispravan format elektronske pošte.");
            return;
        }
    
        if (!passwordPattern.test(employeeData.password)) {
            toast.error("Neuspešno kreiranje zaposlenog. Lozinka mora sadržati najmanje 10 karaktera, od kojih bar jedno malo slovo, jedno veliko slovo, jedan broj i jedan specijalni karakter.");
            return;
        }

        const formData = new FormData();
        formData.append('first_name', employeeData.first_name);
        formData.append('last_name', employeeData.last_name);
        formData.append('email', employeeData.email);
        formData.append('password', employeeData.password);
        formData.append('role', employeeData.role);
        formData.append('gender', employeeData.gender);
        
        if (employeeData.profile_image) {
            formData.append('profile_image', employeeData.profile_image);
        }

        try {
            const response = await fetch('http://localhost:8000/employees/new', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (response.ok) {
                toast.success("Uspešno kreiran nalog za zaposlenog " + employeeData.first_name + " " + employeeData.last_name + "!");
                setModalOpen(false);
            } else {
                toast.error("Došlo je do neočekivane greške prilikom kreiranja studentskog naloga.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className='wrap'>
            <Sidebar />
            <div className='content'>
                <h1 className='page-title'>Upravljanje zaposlenima</h1>
                <div className="search-bar">
                    <i className="fi fi-rr-search search-icon"></i>
                    <input type="text" className="search-input" placeholder="Pretražite zaposlene unošenjem imena ili prezimena..." onChange={handleSearchChange} />
                </div>

                <NewEmployeeModal 
                  isOpen={isModalOpen} 
                  onClose={handleCloseModal} 
                  onSubmit={handleSubmit} 
                  employeeData={employeeData} 
                  onInputChange={handleInputChange} 
                  onSelectRoleChange={handleRoleSelectChange}
                  onSelectGenderChange={handleGenderSelectChange} 
                />
                <button className='new-employee-button' onClick={handleOpenModal}><div className='new-button-content'><i className="fi fi-rs-add"></i> DODAJ ZAPOSLENOG</div></button>

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
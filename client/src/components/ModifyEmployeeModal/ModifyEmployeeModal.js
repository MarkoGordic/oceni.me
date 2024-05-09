import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './modifyEmployeeModal.css';
import { useUser } from '../../contexts/UserContext';

const customSelectStyles = {
    control: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: isFocused ? '#1993F0' : 'white',
        color: '#F7F7FF',
        width: '350px',
        minHeight: '40px',
        '&:hover': { borderColor: '#1993F0' },
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        marginBottom: '10px',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        color: '#F7F7FF',
        width: 350,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.25)',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#1993F0' : isFocused ? '#2C2B2B' : undefined,
        color: isSelected ? '#F7F7FF' : '#F7F7FF',
        '&:active': { backgroundColor: '#1993F0' },
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        '&:hover': { color: '#F7F7FF' },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: '#1993F0',
    }),
    placeholder: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    input: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
  };

function ModifyEmployeeModal({ isOpen, onClose, employeeId, onEmployeeDeleted, onComplete}) {
    const { user } = useUser();
    const currentUserId = user.id;
    const [employeeData, setEmployeeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('employeeInfo');
    const animatedComponents = makeAnimated();

    useEffect(() => {
        console.log("EMPLOYEE DATA:", employeeData);
    }, [employeeData]);

    useEffect(() => {
        if (isOpen && employeeId) {
            fetchEmployeeData(employeeId);
        }
    }, [isOpen, employeeId]);

    async function fetchEmployeeData(id) {
        setIsLoading(true);
        setEmployeeData(null);
        try {
            const response = await fetch(`http://localhost:8000/employees/get/${id}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom dohvatanja podataka zaposlenog.");
                return;
            }
            const data = await response.json();
            data.password = '';

            const roleOption = roleOptions.find(option => option.value === data.role) || { value: 'NP', label: 'NIJE POZNATO' };
            const genderOption = genderOptions.find(option => option.value === data.gender) || { value: 'NP', label: 'NIJE POZNATO' };
            setEmployeeData({
                ...data,
                gender: genderOption,
                role: roleOption,
            });
        } catch (error) {
            console.error("Error fetching employee data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteEmployee = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/employees/delete/${employeeId}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                toast.success("Zaposleni je uspešno obrisan.");
                onClose();
                setActiveTab('employeeInfo');
                setEmployeeData(null);
                onEmployeeDeleted();
            } else {
                if(response.status === 403) {
                    toast.error("Ne možete obrisati svog nalog.");
                } else {
                    toast.error("Došlo je do greške prilikom brisanja zaposlenog.");
                }
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Došlo je do greške prilikom brisanja zaposlenog.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        onClose();
        setActiveTab('employeeInfo');
        setEmployeeData(null);
    };

    const handleModalContentClick = (e) => e.stopPropagation();

    const handleTabClick = (tabName) => setActiveTab(tabName);

    const handleEmployeeInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleGenderSelectChange = selectedOption => {
        setEmployeeData({ ...employeeData, gender: selectedOption });
    };

    const genderOptions = [
        { value: 'M', label: 'MUŠKO' },
        { value: 'F', label: 'ŽENSKO' },
        { value: 'NP', label: 'NIJE POZNATO'}
    ];

    const handleRoleSelectChange = selectedOption => {
        setEmployeeData({ ...employeeData, role: selectedOption });
    };

    const roleOptions = [
        { value: 0, label: 'Superadmin' },
        { value: 1, label: 'Dekan' },
        { value: 2, label: 'Profesor' },
        { value: 3, label: 'Asistent' },
        { value: 4, label: 'Demonstrator' },
    ];

    const saveChanges = async () => {
        setIsLoading(true);
        try {
            if (employeeData.password === '') {
                delete employeeData.password;
            }
    
            const response = await fetch(`http://localhost:8000/employees/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...employeeData,
                    role: employeeData.role.value,
                    gender: employeeData.gender.value,
                    id: employeeId,
                }),
                credentials: 'include',
            });
    
            if (!response.ok) {
                if(response.status === 423)
                    toast.error("Ne možete menjati podatke za superadmina.");
                else if(response.status === 403)
                    toast.error("Ne možete postaviti korisnika kao superadmina.");
                else
                    toast.error("Došlo je do greške prilikom ažuriranja podataka zaposlenog.");
            }
    
            toast.success("Podaci zaposlenog su uspešno ažurirani.");
            onComplete();
            onClose();
        } catch (error) {
            console.error("Error updating employee:", error);
            toast.error("Došlo je do greške prilikom ažuriranja podataka zaposlenog.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderRightColumnContent = () => {
        if (isLoading) {
            return <div>Loading...</div>;
        }

        if (employeeId === 1 && currentUserId !== 1) {
            return (
                <div style={{ color: '#FF5555', fontWeight: 'bold', padding: '20px' }}>
                    <i className="fi fi-rr-warning"></i>
                    <p>Nije dozvoljeno menjati podatke za ovog zaposlenog.</p>
                </div>
            );
        }

        if (!employeeData) {
            return <div>Podaci o zaposlenom nisu pronađeni. Kontaktirajte administratora.</div>;
        }

        switch (activeTab) {
            case 'employeeInfo':
                return (
                    <div>
                        <div>
                            <img className='employeeInfo-avatar' src={'http://localhost:8000/user_pfp/' + employeeData.id + '.jpg'} alt="Employee Avatar" />
                            <div className='employeeInfo-data-wrap'>
                                <label className='employeeInfo-label' htmlFor="first_name">Ime zaposlenog:</label>
                                <input className='employeeInfo-input' type="text" id="first_name" name="first_name" value={employeeData.first_name || ''} onChange={handleEmployeeInputChange} />

                                <label className='employeeInfo-label' htmlFor="last_name">Prezime zaposlenog:</label>
                                <input className='employeeInfo-input' type="text" id="last_name" name="last_name" value={employeeData.last_name || ''} onChange={handleEmployeeInputChange} />

                                <label className='employeeInfo-label' htmlFor="gender">Pol:</label>
                                <Select
                                    id="gender"
                                    components={animatedComponents}
                                    options={genderOptions}
                                    styles={customSelectStyles}
                                    placeholder="Pol"
                                    isClearable={false}
                                    className="gender-select"
                                    value={employeeData.gender !== null ? employeeData.gender : { value: 'NP', label: 'NIJE POZNATO' }}
                                    onChange={handleGenderSelectChange}
                                />

                                <label className='employeeInfo-label' htmlFor="role">Pozicija:</label>
                                <Select
                                    id="role"
                                    components={animatedComponents}
                                    options={roleOptions}
                                    styles={customSelectStyles}
                                    placeholder="Pozicija"
                                    isClearable={false}
                                    className="role-select"
                                    value={employeeData.role !== null ? employeeData.role : { value: 'NP', label: 'NIJE POZNATO' }}
                                    onChange={handleRoleSelectChange}
                                />

                                <label className='employeeInfo-label' htmlFor="email">Email:</label>
                                <input className='employeeInfo-input' type="email" id="email" name="email" value={employeeData.email || ''} onChange={handleEmployeeInputChange} />

                                <label className='employeeInfo-label' htmlFor="password">Postavi novu lozinku:</label>
                                <input className='employeeInfo-input' type="text" id="password" name="password" placeholder="MnogoJakaSifra" onChange={handleEmployeeInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className='modifyModalAdmin-wrap'>
                        <p style={{ color: '#FF5555', fontWeight: 'bold', marginBottom: '20px' }}>
                            Upozorenje: Brisanje zaposlenog je trajna akcija koja se ne može poništiti.
                        </p>
                        <button onClick={deleteEmployee}>
                            Obriši Zaposlenog
                        </button>
                    </div>
                );
            default:
                return <div>?</div>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modify-employee-modal-overlay" onClick={handleOverlayClick}>
            <div className="modify-employee-modal-content" onClick={handleModalContentClick}>
                <div className='modify-employee-modal-column-left'>
                    <div className="tabs-container">
                        <div className={`modify-employee-modal-tab ${activeTab === 'employeeInfo' ? 'active' : ''}`} onClick={() => handleTabClick('employeeInfo')}>
                            <i className='fi fi-bs-user'></i>
                            <p className='sidebar-route-text'>O Zaposlenom</p>
                        </div>
                        <div className={`modify-employee-modal-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => handleTabClick('admin')}>
                            <i className='fi fi-rs-shield'></i>
                            <p className='sidebar-route-text'>Upravljanje Nalogom</p>
                        </div>
                    </div>

                    <div className="bottom-buttons-container">
                    <div className="modify-employee-modal-button-green" onClick={saveChanges}>
                        <i className='fi fi-rs-disk'></i>
                        <p className='sidebar-route-text'>SAČUVAJ</p>
                    </div>
                    <div className="modify-employee-modal-button-red" onClick={onClose}>
                        <i className='fi fi-br-cross'></i>
                        <p className='sidebar-route-text'>ODUSTANI</p>
                    </div>
                </div>
                </div>
                <div className='modify-employee-modal-column-right'>
                    {renderRightColumnContent()}
                </div>
            </div>
        </div>
    );
}

export default ModifyEmployeeModal;

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './modifyStudentModal.css';

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

function ModifyStudentModal({ isOpen, onClose, studentId, onStudentDeleted, onComplete }) {
    const [studentData, setStudentData] = useState(null);
    const [testResults, setTestResults] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('studentInfo');
    const animatedComponents = makeAnimated();

    useEffect(() => {
        if (isOpen && studentId) {
            fetchStudentData(studentId);
        }
    }, [isOpen, studentId]);

    useEffect(() => {
        if (studentData) {
            fetchTestResults(studentData.id);
        }
    }, [studentData]);

    async function fetchTestResults(studentId) {
        try {
            const response = await fetch(`http://localhost:8000/students/tests/${studentId}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setTestResults(data);
            } else {
                toast.error("Došlo je do greške prilikom učitavanja testova.");
            }
        } catch (error) {
            console.error("Error fetching tests:", error);
            toast.error("Došlo je do greške prilikom učitavanja testova.");
        }
    }

    async function fetchStudentData(id) {
        setIsLoading(true);
        setStudentData(null);
        try {
            const response = await fetch(`http://localhost:8000/students/get/${id}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            const genderOption = genderOptions.find(option => option.value === data.gender);
            setStudentData({ ...data, gender: genderOption || null });
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteStudent = async () => {
        setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/students/delete/${studentId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    setStudentData(null);
                    onStudentDeleted(studentId);
                    setActiveTab('studentInfo');
                    toast.success("Student je uspešno obrisan.");
                    onClose();
                } else {
                    toast.error("Došlo je do greške prilikom brisanja studenta.");
                }
            } catch (error) {
                console.error("Error deleting student:", error);
                toast.error("Došlo je do greške prilikom brisanja studenta.");
            } finally {
                setIsLoading(false);
            }
    };

    const handleOverlayClick = (e) => {
        onClose();
        setActiveTab('studentInfo');
        setStudentData(null);
    };

    const handleStudentInputChange = (e) => {
        const { name, value } = e.target;
        setStudentData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleGenderSelectChange = selectedOption => {
        setStudentData({ ...studentData, gender: selectedOption });
    };

    const handleModalContentClick = (e) => e.stopPropagation();

    const handleTabClick = (tabName) => setActiveTab(tabName);

    const genderOptions = [
        { value: 'M', label: 'MUŠKO' },
        { value: 'F', label: 'ŽENSKO' },
        { value: 'NP', label: 'NIJE POZNATO'}
      ];
    
    const renderRightColumnContent = () => {
        if (isLoading) {
            return <div>Loading...</div>;
        }

        if (!studentData) {
            return <div>No data found.</div>;
        }

        switch (activeTab) {
            case 'studentInfo':
                return (
                    <div>
                        <img className='studentInfo-avatar' src={'http://localhost:8000/student_pfp/' + studentData.id + '.jpg'}></img>
                        <div className='studentInfo-data-wrap'>
                            <label className='studentInfo-label' htmlFor="first_name">Ime studenta:</label>
                            <input className='studentInfo-input' type="text" id="first_name" name="first_name" value={studentData.first_name || ''} onChange={handleStudentInputChange} />

                            <label className='studentInfo-label' htmlFor="last_name">Prezime studenta:</label>
                            <input className='studentInfo-input' type="text" id="last_name" name="last_name" value={studentData.last_name || ''} onChange={handleStudentInputChange} />

                            <label className='studentInfo-label' htmlFor="gender">Pol:</label>
                            <Select
                                id="gender"
                                components={animatedComponents}
                                options={genderOptions}
                                styles={customSelectStyles}
                                placeholder="Pol"
                                isClearable={false}
                                className="gender-select"
                                value={studentData.gender !== null ? studentData.gender : { value: 'NP', label: 'NIJE POZNATO' }}
                                onChange={handleGenderSelectChange}
                            />

                            <label className='studentInfo-label' htmlFor="index_number">Broj indeksa:</label>
                            <input className='studentInfo-input' type="text" id="index_number" name="index_number" value={studentData.index_number || ''} onChange={handleStudentInputChange} />
                            
                            <label className='studentInfo-label' htmlFor="email">Elektronska pošta:</label>
                            <input className='studentInfo-input' type="email" id="email" placeholder="primer.tidajem@uns.ac.rs" name="email" value={studentData.email || ''} onChange={handleStudentInputChange} />

                            <label className='studentInfo-label' htmlFor="password">Postavi novu lozinku:</label>
                            <input className='studentInfo-input' type="password" id="password" placeholder="MnogoJakaSifra" name="password" onChange={handleStudentInputChange} />
                        </div>
                    </div>
                );
            case 'tests':
                return (
                    <div>
                        <div className='studentModifyModal-tests'>
                            {renderTestResults()}
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className='modifyModalAdmin-wrap'>
                        <p style={{ color: '#FF5555', fontWeight: 'bold', marginBottom: '20px' }}>
                            Upozorenje: Brisanje studenta je trajna akcija koja se ne može poništiti.
                        </p>
                        <button onClick={deleteStudent}>
                            Obriši Studenta
                        </button>
                    </div>
                );                
            default:
                return <div>?</div>;
        }
    };

    if (!isOpen) return null;

    const saveChanges = async () => {
        setIsLoading(true);
        try {
            if (studentData.password === '') {
                delete studentData.password;
            }
    
            const response = await fetch(`http://localhost:8000/students/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...studentData,
                    gender: studentData.gender.value,
                    id: studentId,
                }),
                credentials: 'include',
            });
    
            if (!response.ok) {
                toast.error('Došlo je do greške prilikom ažuriranja podataka studenta.');
            }
    
            toast.success("Podaci studenta su uspešno ažurirani.");
            onComplete();
            onClose();
        } catch (error) {
            console.error("Error updating student data:", error);
            toast.error("Došlo je do greške prilikom ažuriranja podataka studenta.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderTestResults = () => {
        if (testResults.length === 0) {
            return <p>No test results found.</p>;
        }
        return testResults.map((test, index) => (
            <div key={index} className='studentModifyModal-test'>
                <img src={'http://localhost:8000/user_pfp/' + test.employee_id + '.jpg'} alt="Employee" />
                <div className='studentModifyModal-test-details'>
                    <p className='studentModifyModal-test-name'>{test.test_name}</p>
                    <p className='studentModifyModal-test-subject'>{test.subject_name} {test.subject_code} - {test.subject_year}</p>
                    <p className='studentModifyModal-test-date'>Date: {new Date(test.created_at).toLocaleDateString()}</p>
                    <p className='studentModifyModal-test-grade'>Score: {test.score}/{test.total_possible_points}</p>
                </div>
            </div>
        ));
    };    

    return (
        <div className="modify-student-modal-overlay" onClick={handleOverlayClick}>
            <ToastContainer theme='dark'/>
            <div className="modify-student-modal-content" onClick={handleModalContentClick}>
            <div className='modify-student-modal-column-left'>
                <div className="tabs-container">
                    <div className={`modify-student-modal-tab ${activeTab === 'studentInfo' ? 'active' : ''}`} onClick={() => handleTabClick('studentInfo')}>
                        <i className='fi fi-bs-user'></i>
                        <p className='sidebar-route-text'>O Studentu</p>
                    </div>
                    <div className={`modify-student-modal-tab ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => handleTabClick('tests')}>
                        <i className='fi fi-rr-edit'></i>
                        <p className='sidebar-route-text'>Kolokvijumi</p>
                    </div>
                    <div className={`modify-student-modal-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => handleTabClick('admin')}>
                        <i className='fi fi-rs-shield'></i>
                        <p className='sidebar-route-text'>Upravljaj nalogom</p>
                    </div>
                </div>

                <div className="bottom-buttons-container">
                    <div className="modify-student-modal-button-green" onClick={saveChanges}>
                        <i className='fi fi-rs-disk'></i>
                        <p className='sidebar-route-text'>SAČUVAJ</p>
                    </div>
                    <div className="modify-student-modal-button-red" onClick={onClose}>
                        <i className='fi fi-br-cross'></i>
                        <p className='sidebar-route-text'>ODUSTANI</p>
                    </div>
                </div>
            </div>
            <div className='modify-student-modal-column-right'>
                    {renderRightColumnContent()}
            </div>
            </div>
        </div>
    );
}

export default ModifyStudentModal;

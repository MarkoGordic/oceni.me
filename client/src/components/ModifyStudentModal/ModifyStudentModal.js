import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './modifyStudentModal.css';

function ModifyStudentModal({ isOpen, onClose, studentId, onStudentDeleted  }) {
    const [studentData, setStudentData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('studentInfo');

    useEffect(() => {
        if (isOpen && studentId) {
            fetchStudentData(studentId);
        }
    }, [isOpen, studentId]);

    async function fetchStudentData(id) {
        setIsLoading(true);
        setStudentData(null);
        try {
            const response = await fetch(`http://localhost:8000/students/get/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setStudentData(data);
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteStudent = async () => {
        setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/students/delete/${studentId}`);
                if (response.ok) {
                    toast.success("Student je uspešno obrisan.");
                    onClose();
                    setActiveTab('studentInfo');
                    setStudentData(null);
                    onStudentDeleted();
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

    const handleModalContentClick = (e) => e.stopPropagation();

    const handleTabClick = (tabName) => setActiveTab(tabName);

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
                        <div>
                            <img className='studentInfo-avatar' src={'http://localhost:8000/student_pfp/' + studentData.id + '.jpg'}></img>
                            <div className='studentInfo-data-wrap'>
                                <label className='studentInfo-label' htmlFor="first_name">Ime studenta:</label>
                                <input className='studentInfo-input' type="text" id="first_name" name="first_name" value={studentData.first_name || ''} />

                                <label className='studentInfo-label' htmlFor="last_name">Prezime studenta:</label>
                                <input className='studentInfo-input' type="text" id="last_name" name="last_name" value={studentData.last_name || ''} />

                                <label className='studentInfo-label' htmlFor="index_number">Broj indeksa:</label>
                                <input className='studentInfo-input' type="text" id="index_number" name="index_number" value={studentData.index_number || ''} />
                            
                                <label className='studentInfo-label' htmlFor="email">Elektronska pošta:</label>
                                <input className='studentInfo-input' type="email" id="email" placeholder="primer.tidajem@uns.ac.rs" name="email" value={studentData.email || ''} />

                                <label className='studentInfo-label' htmlFor="password">Postavi novu lozinku:</label>
                                <input className='studentInfo-input' type="password" id="password" placeholder="MnogoJakaSifra" name="password" />

                            </div>
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

    return (
        <div className="modify-student-modal-overlay" onClick={handleOverlayClick}>
            <div className="modify-student-modal-content" onClick={handleModalContentClick}>
            <div className='modify-student-modal-column-left'>
                    <div className={`modify-student-modal-tab ${activeTab === 'studentInfo' ? 'active' : ''}`} onClick={() => handleTabClick('studentInfo')}>
                        <i className='fi fi-bs-user'></i>
                        <p className='sidebar-route-text'>O Studentu</p>
                    </div>
                    <div className={`modify-student-modal-tab ${activeTab === 'manageGroups' ? 'active' : ''}`} onClick={() => handleTabClick('manageGroups')}>
                        <i className='fi fi-rr-users'></i>
                        <p className='sidebar-route-text'>Upravljaj grupama</p>
                    </div>
                    <div className={`modify-student-modal-tab ${activeTab === 'activiyLogs' ? 'active' : ''}`} onClick={() => handleTabClick('activiyLogs')}>
                    <i className='fi fi-sr-time-past'></i>
                        <p className='sidebar-route-text'>Aktivnosti</p>
                    </div>
                    <div className={`modify-student-modal-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => handleTabClick('contact')}>
                        <i className='fi fi-rr-paper-plane'></i>
                        <p className='sidebar-route-text'>Kontaktiraj studenta</p>
                    </div>
                    <div className={`modify-student-modal-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => handleTabClick('admin')}>
                        <i className='fi fi-rs-shield'></i>
                        <p className='sidebar-route-text'>Upravljaj nalogom</p>
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

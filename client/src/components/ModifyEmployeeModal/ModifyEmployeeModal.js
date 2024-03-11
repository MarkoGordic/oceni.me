import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './modifyEmployeeModal.css';

function ModifyEmployeeModal({ isOpen, onClose, employeeId, onEmployeeDeleted }) {
    const [employeeData, setEmployeeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('employeeInfo');

    useEffect(() => {
        if (isOpen && employeeId) {
            fetchEmployeeData(employeeId);
        }
    }, [isOpen, employeeId]);

    async function fetchEmployeeData(id) {
        setIsLoading(true);
        setEmployeeData(null);
        try {
            const response = await fetch(`http://localhost:8000/employees/get/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setEmployeeData(data);
        } catch (error) {
            console.error("Error fetching employee data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteEmployee = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/employees/delete/${employeeId}`);
            if (response.ok) {
                toast.success("Zaposleni je uspešno obrisan.");
                onClose();
                setActiveTab('employeeInfo');
                setEmployeeData(null);
                onEmployeeDeleted();
            } else {
                toast.error("Došlo je do greške prilikom brisanja zaposlenog.");
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

    const renderRightColumnContent = () => {
        if (isLoading) {
            return <div>Loading...</div>;
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
                                <input className='employeeInfo-input' type="text" id="first_name" name="first_name" value={employeeData.first_name || ''} readOnly />

                                <label className='employeeInfo-label' htmlFor="last_name">Prezime zaposlenog:</label>
                                <input className='employeeInfo-input' type="text" id="last_name" name="last_name" value={employeeData.last_name || ''} readOnly />

                                <label className='employeeInfo-label' htmlFor="email">Email:</label>
                                <input className='employeeInfo-input' type="email" id="email" name="email" value={employeeData.email || ''} readOnly />

                                <label className='employeeInfo-label' htmlFor="department">Odeljenje:</label>
                                <input className='employeeInfo-input' type="text" id="department" name="department" value={employeeData.department || ''} readOnly />
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
                    <div className={`modify-employee-modal-tab ${activeTab === 'employeeInfo' ? 'active' : ''}`} onClick={() => handleTabClick('employeeInfo')}>
                        <i className='fi fi-bs-user'></i>
                        <p className='sidebar-route-text'>O Zaposlenom</p>
                    </div>
                    <div className={`modify-employee-modal-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => handleTabClick('admin')}>
                        <i className='fi fi-rs-shield'></i>
                        <p className='sidebar-route-text'>Upravljanje Nalogom</p>
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

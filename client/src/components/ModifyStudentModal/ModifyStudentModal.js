import React, { useState, useEffect } from 'react';
import './modifyStudentModal.css';

function ModifyStudentModal({ isOpen, onClose, studentId }) {
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
        try {
            const response = await fetch(`http://localhost:8000/students/${id}`);
            const data = await response.json();
            setStudentData(data);
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleOverlayClick = (e) => {
        onClose();
    };

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const renderRightColumnContent = () => {
        switch (activeTab) {
            case 'studentInfo':
                return <div>Podaci o studentu</div>;
            case 'manageGroups':
                return <div>Upravljanje grupama</div>;
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

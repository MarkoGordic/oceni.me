import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import './mySubjects.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import SubjectContainer from '../../components/SubjectContainer/SubjectContainer';
import { useNavigate } from 'react-router-dom';

const MySubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch('http://localhost:8000/subjects/me', {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSubjects(data);
        } catch (error) {
            console.error('There was a problem fetching subjects:', error);
            toast.error("Error fetching subjects.");
        }
    };

    const handleSubjectClick = (subjectId) => {
        navigate(`/subjects/${subjectId}/overview`);
    };

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <Sidebar />
            <div className='content'>
                <h1>Moji predmeti</h1>
                <p>Ovde možete videti sve predmete kojima možete upravljati. Kliknite na predmet da biste videli više informacija.</p>
                <div className='subjects-list'>
                    {subjects.map((subject) => (
                        <div key={subject.id} onClick={() => handleSubjectClick(subject.id)}>
                            <SubjectContainer subject={subject} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MySubjects;
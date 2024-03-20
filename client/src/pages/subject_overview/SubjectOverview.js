import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import './subjectOverview.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';

const SubjectOverview = () => {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);

    useEffect(() => {
        const fetchSubjectData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/subjects/get/${id}`);
                if (!response.ok) {
                    throw new Error('Could not fetch subject data');
                }
                const data = await response.json();
                setSubject(data);
            } catch (error) {
                console.error('Failed to fetch subject:', error);
                toast.error('Došlo je do greške prilikom učitavanja predmeta.');
            }
        };

        fetchSubjectData();
    }, [id]);

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            <div className='content'>
                <h1>Pregled predmeta</h1>
                {subject ? (
                    <div>
                        <h2>{subject.name} ({subject.code}) - {subject.year}</h2>
                    </div>
                ) : (
                    <p>Loading subject data...</p>
                )}
            </div>
        </div>
    );
};

export default SubjectOverview;

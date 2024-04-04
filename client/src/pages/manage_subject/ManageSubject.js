import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import './manageSubject.css';

function ManageSubject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subjectData, setSubjectData] = useState({});

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');

    useEffect(() => {
        fetchSubjectData();
    }, []);

    const fetchSubjectData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/subjects/get/${id}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const subject = await response.json();
                console.log(subject);
                setNewSubjectName(subject.subject_name);
                setNewSubjectCode(subject.code);
            } else {
                toast.error('Došlo je do greške prilikom učitavanja podataka o predmetu.');
            }
        } catch (error) {
            console.error('Error fetching subject data:', error);
            toast.error('Došlo je do greške prilikom učitavanja podataka o predmetu.');
        }
    };

    return (
    <div className='wrap'>
        <ToastContainer theme="dark" />
        <SubjectSidebar />
        <div className='content'>
            <h1>Upravljanje predmetom</h1>

            <div className='subject-manage-wrap'>
                <label className='studentInfo-label' htmlFor="firstName">Ime:</label>
                <input className='studentInfo-input' type="text" id="firstName" name="firstName" />
            </div>
        </div>
    </div>
)};

export default ManageSubject;
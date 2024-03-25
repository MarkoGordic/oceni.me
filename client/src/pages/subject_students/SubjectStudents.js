import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './subjectStudents.css';
import { toast, ToastContainer } from 'react-toastify';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';

function SubjectStudents() {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchSubjectData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/subjects/get/${id}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Could not fetch subject data');
                }
                const data = await response.json();
                setSubject(data);

                const studentsResponse = await fetch(`http://localhost:8000/students/from_subject/${id}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!studentsResponse.ok) {
                    throw new Error('Could not fetch students data');
                }
                const studentsData = await studentsResponse.json();
                setStudents(studentsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Došlo je do greške prilikom učitavanja podataka.');
            }
        };

        if (id) {
            fetchSubjectData();
        }
    }, [id]);

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            <div className='content'>
                <h1>Spisak studenata</h1>
                {subject ? (
                    <div>
                        <p className='subjectstudents-subject-name'>{subject.name}</p>
                        <table className="subject-students-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Ime</th>
                                    <th>Prezime</th>
                                    <th>Broj indeksa</th>
                                    <th>Elektronska pošta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id}>
                                        <td>{index + 1}</td>
                                        <td>{student.first_name}</td>
                                        <td>{student.last_name}</td>
                                        <td>{student.index_number}</td>
                                        <td>{student.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Učitavanje u toku...</p>
                )}
            </div>
        </div>
    );
}

export default SubjectStudents;

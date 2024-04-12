import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './testListing.css';
import { toast, ToastContainer } from 'react-toastify';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';

function TestListing() {
    const { testid } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [testData, setTestData] = useState({});

    useEffect(() => {
        async function fetchInitialStudentData() {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/tests/get?testId=${testid}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    toast.error("Došlo je do greške prilikom učitavanja testova.");
                }
                const data = await response.json();
                setTestData(data);
                fetchAdditionalStudentDetails(JSON.parse(data.final_students));
                setStudents(JSON.parse(data.final_students));
            } catch (err) {
                toast.error("Failed to load tests.");
            }
        };

        async function fetchAdditionalStudentDetails(students) {
            try {
                const response = await fetch(`http://localhost:8000/tests/gradings/get`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ testId: testid }),
                });
        
                if (!response.ok) {
                    toast.error("Došlo je do greške prilikom učitavanja rezultata.");
                }
        
                const gradings = await response.json();
        
                const gradingsMap = gradings.reduce((map, grading) => {
                    map[grading.index_number] = grading;
                    return map;
                }, {});

                const enrichedStudents = students.map(student => {
                    const grading = gradingsMap[student.index];
                    return {
                        ...student,
                        autotest_status: grading ? grading.status : 'PRIPREMLJEN',
                        points: grading ? grading.grading : '?',
                        maxPoints: testData.total_points
                    };
                });

                setStudents(enrichedStudents);
            } catch (error) {
                toast.error("Error loading test results.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchInitialStudentData();
    }, [testid]);

    function getAcs() {
        const downloadUrl = `http://localhost:8000/tests/generate-pdf?testId=${testid}`;
        window.open(downloadUrl, '_blank').focus();
    }

    if (isLoading) return <div className='loader'>Loading...</div>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            <div className='content'>
                <h1>Kolokvijum - {testData.name}</h1>

                <button className='get-acs-button' onClick={getAcs}>ACS IZVEŠTAJ</button>

                <h2>Listing Studenata</h2>
                <table className="test-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Puno Ime</th>
                            <th>Indeks</th>
                            <th>Računar</th>
                            <th>AT Status</th>
                            <th>Poeni</th>
                            <th>Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{student.firstName} {student.lastName}</td>
                                <td>{student.index}</td>
                                <td>{student.pc}</td>
                                <td>{student.autotest_status}</td>
                                <td>{student.points || 0} / {testData.total_points}</td>
                                <td className="action-buttons">
                                    <button className="test-configuration-card-action"><i className="fi fi-rr-eye"></i></button>
                                    <button className="test-configuration-card-action"><i className="fi fi-rr-play"></i></button>
                                    <button className="test-configuration-card-action"><i className="fi fi-rr-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TestListing;

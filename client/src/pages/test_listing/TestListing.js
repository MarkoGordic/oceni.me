import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './testListing.css';
import { toast, ToastContainer } from 'react-toastify';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import StudentUploadTestFilesModal from '../../components/StudentUploadTestFilesModal/StudentUploadTestFilesModal';
import { useNavigate } from 'react-router-dom';

function TestListing() {
    const { testid } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [testData, setTestData] = useState({});

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const navigate = useNavigate();

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
                    let autotest_progress = 0;

                    if (grading && grading.status === 'OCENJEN') {
                        autotest_progress = 100;
                    }

                    return {
                        ...student,
                        autotest_status: grading ? grading.status : 'PRIPREMLJEN',
                        points: grading ? grading.total_points : '?',
                        maxPoints: testData.total_points,
                        autotest_progress: autotest_progress
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

    const getStatusClassName = (status) => {
        switch(status) {
            case 'NEMA_FAJLOVA':
                return 'NEMA_FAJLOVA';
            case 'PRIPREMLJEN':
                return 'PRIPREMLJEN';
            case 'TESTIRANJE':
                return 'TESTIRANJE';
            case 'OCENJEN':
                return 'OCENJEN';
            default:
                return '';
        }
    };

    const handleStartStudentAutotest = (studentIndex, pc, fullName) => {
        const updatedStudents = students.map(student => {
            if (student.index === studentIndex) {
                return { ...student, autotest_status: 'TESTIRANJE', autotest_progress: 0 };
            }
            return student;
        });
        setStudents(updatedStudents);

        fetch('http://localhost:8000/autotest/run/student', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testId: testid,
                studentIndex,
                pc: pc,
            }),
        }).then((response) => {
            if (response.ok) {
                toast.success('Automatsko testiranje je pokrenuto za studenta ' + fullName + '.');
            } else {
                toast.error('Neuspešno pokretanje automatskog testiranja.');
            }
        }).catch((error) => {
            toast.error('Failed to start autotest process.');
            console.error(error);
        });
    }

    function handleStartAllAutotests() {
        const tasks = students.map(student => ({
            studentIndex: student.index,
            pc: student.pc
        }));
    
        fetch('http://localhost:8000/autotest/run/group', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testId: testid,
                tasks,
            }),
        }).then((response) => {
            if (response.ok) {
                toast.success('Automatsko testiranje pokrenuto za sve studente.');
                const updatedStudents = students.map(student => ({
                    ...student,
                    autotest_status: 'TESTIRANJE',
                    autotest_progress: 0
                }));
                setStudents(updatedStudents);
            } else {
                toast.error('Neuspešno pokretanje automatskog testiranja za sve studente.');
            }
        }).catch((error) => {
            toast.error('Failed to start autotest process for all students.');
            console.error(error);
        });
    }

    const handleAutotestStatusUpdate = () => {
        const studentIndexes = students.filter(student => student.autotest_status === 'TESTIRANJE')
                                       .map(student => student.index);
    
        if (studentIndexes.length === 0) {
            toast.info('Nema studenata u procesu testiranja.');
            return;
        }
    
        console.log(studentIndexes);
        fetch('http://localhost:8000/autotest/progress', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testId: testid,
                studentIndexes,
            }),
        }).then(async (response) => {
            if (response.ok) {
                const data = await response.json();
                toast.success('Automatsko testiranje je osveženo.');
                console.log(data);
    
                const updatedStudents = students.map(student => {
                    const statusUpdate = data.find(status => status.studentIndex === student.index);
                    if (statusUpdate) {
                        return {
                            ...student,
                            points: statusUpdate.points,
                            autotest_status: statusUpdate.status,
                            autotest_progress: (statusUpdate.autotest_progress || 0)
                        };
                    }
                    return student;
                });
    
                setStudents(updatedStudents);
            } else {
                toast.error('Neuspešno osvežavanje automatskog testiranja.');
            }
        }).catch((error) => {
            toast.error('Failed to update autotest status.');
            console.error(error);
        });
    };

    const handleAddFiles = (studentIndex, pc, studentId) => {
        setSelectedStudent({ index: studentIndex, pc: pc, studentId: studentId});
        setShowUploadModal(true);
    };

    const updateStudentStatus = (studentId, newStatus) => {
        const updatedStudents = students.map(student => {
            if (student.studentId === studentId) {
                return {
                    ...student,
                    autotest_status: newStatus,
                    points: '?',
                    autotest_progress: 0 
                };
            }
            return student;
        });
        setStudents(updatedStudents);
    };    

    const handleUploadSuccess = () => {
        updateStudentStatus(selectedStudent.studentId, 'PRIPREMLJEN');
        setShowUploadModal(false);
    };

    const handleDeleteStudent = (studentId, student_index) => {
        fetch(`http://localhost:8000/tests/remove_student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testId: testid, studentId, student_index}),
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toast.success('Student je uspešno obrisan.');

                setStudents(students.filter(student => student.studentId !== studentId));
            } else {
                toast.error('Došlo je do greške prilikom brisanja studenta.');
            }
        })
        .catch(error => {
            console.error('Error deleting student data:', error);
            toast.error('Došlo je do greške prilikom brisanja studenta.');
        });
    };
    

    useEffect(() => {
        console.log(selectedStudent)
    }, [selectedStudent]);

    const navigateToReview = (studentId) => {
        navigate(`./review/${studentId}`);
    };    

    if (isLoading) return <div className='loader'>Loading...</div>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />

            {showUploadModal && (
                <StudentUploadTestFilesModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={() => handleUploadSuccess()}
                    testId={testid}
                    studentIndex={selectedStudent.index}
                    pc={selectedStudent.pc}
                    studentId={selectedStudent.studentId}
                />
            )}

            <div className='content'>
                <h1>Kolokvijum - {testData.name}</h1>

                <h2>Listing Studenata</h2>
                
                <div className='test-listing-buttons'>
                    <button className='get-acs-button' onClick={getAcs}>ACS IZVEŠTAJ</button>
                    <button className='get-acs-button' onClick={handleStartAllAutotests}>POKRENI AT</button>
                    <button className='get-acs-button' onClick={handleAutotestStatusUpdate}>OSVEZI AT</button>
                </div>

                <table className="test-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Puno Ime</th>
                            <th>Indeks</th>
                            <th>Računar</th>
                            <th>AT Status</th>
                            <th>AT Napredak</th>
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
                                <td className={getStatusClassName(student.autotest_status)}>{student.autotest_status}</td>
                                <td>
                                    <div className="progress-bar">
                                        <span className="progress-bar-fill" style={{width: `${student.autotest_progress || 0}%`}}></span>
                                    </div>
                                </td>
                                <td>{student.points || 0} / {testData.total_points}</td>
                                <td className="action-buttons">
                                    {student.autotest_status !== 'NEMA_FAJLOVA' && (
                                        <button className="test-configuration-card-action" onClick={() => navigateToReview(student.studentId)}><i className="fi fi-rr-eye"></i></button>
                                    )}
                                    {student.autotest_status === 'NEMA_FAJLOVA' && (
                                        <button className="test-configuration-card-action" onClick={() => handleAddFiles(student.index, student.pc, student.studentId)}><i className="fi fi-rr-plus"></i></button>
                                    )}
                                    <button className="test-configuration-card-action" onClick={() => handleStartStudentAutotest(student.index, student.pc, student.firstName + ' ' + student.lastName)}><i className="fi fi-rr-play"></i></button>
                                    <button className="test-configuration-card-action" onClick={() => handleDeleteStudent(student.studentId, student.index)}><i className="fi fi-rr-trash"></i></button>
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

import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import './newTestWizard.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import UploadTab from '../../components/NewTestTabs/UploadTab/UploadTab';
import StudentConfigureTab from "../../components/NewTestTabs/StudentConfigureTab.js/StudentConfigureTab";
import UploadConfigTab from "../../components/NewTestTabs/UploadConfigTab/UploadConfigTab";
import FinalStudentsTab from "../../components/NewTestTabs/FinalStudentsTab/FinalStudentsTab";

const NewTestWizard = () => {
    const { id, testid } = useParams();
    
    const [targetZIP, setTargetTAR] = useState(null);
    const [fileName, setFileName] = useState("");
    
    const [targetJSON, setTargetJSON] = useState(null);
    const [jsonFileName, setJSONFileName] = useState("");

    const [status, setStatus] = useState('');
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [isLoading, setIsLoading] = useState(false);

    const [studentList, setStudentList] = useState([]);
    const [missingStudents, setMissingStudents] = useState([]);
    const [missingStudentsData, setMissingStudentsData] = useState([]);
    
    const navigate = useNavigate();

    useEffect(() => {
        setTabs([
            {
                id: 'upload_config',
                title: 'Upload Config',
                content: <UploadConfigTab
                            setFileName={setJSONFileName}
                            setTargetJSON={setTargetJSON}
                            confirmUpload={() => confirmConfigUpload(targetJSON)}
                            isLoading={isLoading}
                        />
            },
            {
                id: 'upload',
                title: 'Upload ZIP',
                content: <UploadTab
                            setFileName={setFileName}
                            setTargetTAR={setTargetTAR}
                            confirmUpload={() => confirmUpload(targetZIP)}
                            isLoading={isLoading}
                        />
            },
            {
                id: 'configure_missing_students',
                title: 'Configure Students',
                content: <StudentConfigureTab
                            isLoading={isLoading}
                            studentData={studentList}
                            missingIndexes={missingStudents}
                            subjectID={id}
                            setMissingStudents={setMissingStudents}
                            confirmMissingStudents={confirmMissingStudents}
                        />
            },
            {
                id: 'final_students',
                title: 'Final Students',
                content: <FinalStudentsTab
                            isLoading={isLoading}
                            studentList={studentList}
                            testID={testid}
                        />
            }
        ]);
    }, [isLoading, status, missingStudents, targetZIP, targetJSON]);

    useEffect(() => {
        if (testid) {
            fetchTestStatus();
        }
    }, [testid]);

    useEffect(() => {
        if (status === "DODATA_KONFIGURACIJA")
            setActiveTab('upload');
        else if (status === "DODAT_TAR")
            setActiveTab('configure_missing_students');
        else if (status === "PODESENI_STUDENTI")
            setActiveTab('final_students');
        else {
            setActiveTab('upload_config');
        }
    }, [status]);

    const fetchTestStatus = useCallback(() => {
        setIsLoading(true);
        fetch(`http://localhost:8000/tests/status?testId=${testid}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            setStatus(data.status);
            if (data.final_students !== null){
                setStudentList(data.final_students);
            } else if (data.initial_students !== null){
                setStudentList(data.knownStudents);
                setMissingStudents(data.missingStudents);
            } 
        })
        .catch(error => {
            console.error('Error:', error);
            toast.error('Error communicating with the server.');
            setIsLoading(false);
        });
    }, [testid, navigate]);

    const uploadFile = (file) => {
        setIsLoading(true);

        if (!file) {
            toast.error("Nema datoteke za učitavanje. Molimo odaberite TAR datoteku.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('tarFile', file);
        formData.append('subjectId', id);
        formData.append('testId', testid);

        fetch('http://localhost:8000/tests/upload_data', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            setStudentList(data.students);
            setMissingStudents(data.missingStudents);
            setStatus(data.status);
            if (data.testId) {
                toast.success('Uspešno otpremljeno i otpakovano!');
            } else {
                toast.error('Error: Invalid server response.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toast.error('Došlo je do greške prilikom komunikacije sa serverom.');
            setIsLoading(false);
        });
    };

    function confirmUpload(file) {
        uploadFile(file); 
    }

    const uploadConfigurationFile = (file) => {
        setIsLoading(true);

        if (!file) {
            toast.error("Nema datoteke za učitavanje. Molimo odaberite JSON datoteku.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('configFile', file);
        formData.append('subjectId', id);

        fetch('http://localhost:8000/tests/new', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            setStudentList(data.students);
            setMissingStudents(data.missingStudents);
            if (data.testId) {
                toast.success('Uspešno otpremljeno!');
                navigate(`./${data.testId}`); 
            } else {
                toast.error('Error: Invalid server response.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toast.error('Došlo je do greške prilikom komunikacije sa serverom.');
            setIsLoading(false);
        });
    };

    const confirmConfigUpload = (file) => {
        uploadConfigurationFile(file);
    };

    const confirmMissingStudents = async () => {
        setIsLoading(true);
    
        const missingStudentIndexes = missingStudents.map(student => student.index);
    
        try {
            const response = await fetch('http://localhost:8000/tests/confirm_missing_students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    testId: testid,
                    missingStudentIndexes: missingStudentIndexes,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                toast.error('Došlo je do greške prilikom potvrđivanja studenata.');
                return;
            }

            setStudentList(data.finalStudents || []);
            setMissingStudents([]);
            setStatus("PODESENI_STUDENTI");
    
            toast.success('Uspešno potvrđeni studenti!');
        } catch (error) {
            console.error('Error confirming missing students:', error);
            toast.error(error.message || 'Došlo je do greške prilikom potvrđivanja studenata.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar /> 
            <div className='content'>
                <div className="new-test-content-wrap">
                    {tabs.map(tab => (
                        <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
                            {tab.content}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewTestWizard;

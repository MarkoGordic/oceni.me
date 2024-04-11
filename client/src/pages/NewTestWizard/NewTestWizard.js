import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import './newTestWizard.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import UploadTab from '../../components/NewTestTabs/UploadTab/UploadTab';
import StudentConfigureTab from "../../components/NewTestTabs/StudentConfigureTab.js/StudentConfigureTab";

const NewTestWizard = () => {
    const { id, testid } = useParams();
    const [targetZIP, setTargetZIP] = useState(null);
    const [fileName, setFileName] = useState("");
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
                id: 'upload',
                title: 'Upload ZIP',
                content: <UploadTab
                            setFileName={setFileName}
                            setTargetZIP={setTargetZIP}
                            confirmUpload={() => confirmUpload(targetZIP)}
                            isLoading={isLoading}
                        />
            },
            {
                id: 'configure',
                title: 'Configure Students',
                content: <StudentConfigureTab
                            isLoading={isLoading}
                            studentData={studentList}
                            setStudentData={setStudentList}
                            missingIndexes={missingStudents}
                        />
            }
        ]);
    }, [isLoading]);

    useEffect(() => {
        if (testid) {
            fetchTestStatus();
        }
    }, [testid]);

    useEffect(() => {
        console.log('testid:', testid, 'studentList:', studentList)
        if (studentList !== undefined && testid && studentList != []) {
            setActiveTab('configure');
        } else {
            setActiveTab('upload');
        }

    }, [testid, studentList, missingStudents]);

    const fetchTestStatus = useCallback(() => {
        console.log("KOJI KURAC");
        setIsLoading(true);
        fetch(`http://localhost:8000/tests/status?testId=${testid}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            if (data.final_students !== null){
                setStudentList(data.final_students);
            } else if (data.initial_students !== null){
                setStudentList(data.knownStudents);
                setMissingStudents(data.missingStudents);
            } else {
                navigate('../');
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
            toast.error("Nema datoteke za učitavanje. Molimo odaberite ZIP datoteku.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('zipFile', file);
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
                toast.success('Uspešno otpremljeno i otpakovano!');
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

    function confirmUpload(file) {
        uploadFile(file); 
    }

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            <div className='content'>
                <div className="content-wrap">
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

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import './newTestWizard.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import UploadTab from '../../components/NewTestTabs/UploadTab/UploadTab';
import ConfigureTab from "../../components/NewTestTabs/ConfigureTab/ConfigureTab";

const NewTestWizard = () => {
    const { id, testid } = useParams();
    const [targetZIP, setTargetZIP] = useState(null);
    const [fileName, setFileName] = useState("");
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [isLoading, setIsLoading] = useState(false);
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
                title: 'Configure Test',
                content: <ConfigureTab
                            isLoading={isLoading}
                        />
            }
        ]);
    }, [targetZIP, isLoading, testid]);

    useEffect(() => {
        if (testid) {
            setActiveTab('configure');
        } else {
            setActiveTab('upload');
        }
    }, [testid]);

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

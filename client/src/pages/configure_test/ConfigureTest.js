import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import UploadTab from '../../components/ConfigureTestTabs/UploadTab/UploadTab';
import ConfigureTab from '../../components/ConfigureTestTabs/ConfigureTab/ConfigureTab';
import CorrectSolution from '../../components/ConfigureTestTabs/CorrectSolution/CorrectSolution';
import './configureTest.css';

function ConfigureTest() {
    const { id, configid } = useParams();
    const [targetZIP, setTargetZIP] = useState(null);
    const [fileName, setFileName] = useState("");
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [testFiles, setTestFiles] = useState([]);
    const [csTargetFile, setCsTargetFile] = useState(null);
    const [csFileName, setCsFileName] = useState("");
    const [testsConfig, setTestsConfig] = useState([]);
    const [configCompleted, setConfigCompleted] = useState(false);
    const [configStatus, setConfigStatus] = useState(false);
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
                            testFiles={testFiles}
                            setTestsConfig={setTestsConfig}
                            setConfigStatus={setConfigStatus}
                        />
            },
            {
                id: 'correct-solution',
                title: 'Correct Solution',
                content: <CorrectSolution
                            setFileName={setCsFileName}
                            setTargetZIP={setCsTargetFile}
                            confirmUpload={() => completeConfiguration(csTargetFile)}
                            isLoading={isLoading}
                        />
            },
            {
                id: 'completed',
                title: 'Completed',
                content: <div>Configuration is complete.</div>
            }
        ]);
    }, [targetZIP, isLoading, configid, testFiles, csTargetFile, testsConfig, configCompleted]);

    useEffect(() => {
        console.log(configid, configStatus);
        if (configid && configStatus === false) {
            fetchTestConfigStatus();
        }

        if(configStatus === true) {
            setActiveTab('correct-solution');
        }
    }, [configid, configStatus]);

    const fetchTestConfigStatus = () => {
        setIsLoading(true);
        console.log(configid);
        fetch(`http://localhost:8000/tests/status?configId=${configid}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setIsLoading(false);
            if (data.status === 'OBRADA') {
                setTestFiles(data.testConfigs || []);
                setActiveTab('configure');
            } else if (data.status === 'ZAVRSEN') {
                setConfigCompleted(true);
                setActiveTab('completed');
            } else {
                setActiveTab('upload');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toast.error('Došlo je do greške prilikom komunikacije sa serverom. Tražena konfiguracija nije pronađena.');
            setIsLoading(false);
        });
    };

    const uploadFile = (file) => {
        setIsLoading(true);

        if (!file) {
            toast.error("Nema datoteke za učitavanje. Molimo odaberite ZIP datoteku.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('zipFile', file);

        fetch('http://localhost:8000/tests/configure/new', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            if (data.configid) {
                toast.success('Uspešno otpremljeno i otpakovano!');
                setTestFiles(data.files || []);
                navigate(`./${data.configid}`);
            } else {
                toast.error('Došlo je do greške prilikom otpremanja i otpakivanja ZIP datoteke.');
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

    const completeConfiguration = (file) => {
        setIsLoading(true);

        console.log(csFileName, csTargetFile, file);
        if (!file) {
            toast.error("Nema datoteke za učitavanje. Molimo odaberite .S datoteku.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('solutionFile', file);
        formData.append('configid', configid);
        formData.append('testsConfig', JSON.stringify(testsConfig));

        fetch('http://localhost:8000/tests/configure/complete', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                if (response.status === 403) {
                    toast.error('Konfiguracija je već završena.');
                }
            }
            return response.json();
        })
        .then(data => {
            setIsLoading(false);
            if (data.success) {
                setConfigCompleted(true);
                toast.success('File uspešno otpremljen! Konfiguracija je završena.');
            } else {
                toast.error('Došlo je do greške prilikom otpremanja .S datoteke.');
            }
        })
    };

    return(
    <div className='wrap'>
        <ToastContainer theme="dark" />
        <SubjectSidebar />
        <div className='content'>
            <div className="content-wrap">
                    {tabs.map(tab => (
                        <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none', width: '100%'}}>
                            {tab.content}
                        </div>
                    ))}
            </div>
        </div>
    </div>
    )
};

export default ConfigureTest;
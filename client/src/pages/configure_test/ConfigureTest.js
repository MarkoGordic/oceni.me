import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import UploadTab from '../../components/ConfigureTestTabs/UploadTab/UploadTab';
import ConfigureTab from '../../components/ConfigureTestTabs/ConfigureTab/ConfigureTab';
import CorrectSolution from '../../components/ConfigureTestTabs/CorrectSolution/CorrectSolution';
import ConfigComplete from '../../components/ConfigureTestTabs/ConfigComplete/ConfigComplete';
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
    const [configName, setConfigName] = useState("");
    const [isConfigInprogress, setIsConfigInprogress] = useState(false);
    const [testNo, setTestNo] = useState(0);
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
                            setConfigName={setConfigName}
                            configName={configName}
                            setTestNo={setTestNo}
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
                content: <ConfigComplete
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            isCompleted={configCompleted}
                        />
            }
        ]);
    }, [targetZIP, isLoading, configid, testFiles, csTargetFile, testsConfig, configCompleted, configName]);

    useEffect(() => {
        console.log(configid, configStatus, configCompleted);
        if (configid && isConfigInprogress === false && configStatus === false && configCompleted === false) {
            fetchTestConfigStatus();
        }

        if(configid && isConfigInprogress === true && configStatus === false && configCompleted === false) {
            setActiveTab('configure');
        }

        if(configStatus === true && configCompleted === false) {
            setActiveTab('correct-solution');
        }

        if(configCompleted === true) {
            setActiveTab('completed');
        }
    }, [configid, configStatus, configCompleted, testFiles]);

    const fetchTestConfigStatus = () => {
        setIsLoading(true);
        fetch(`http://localhost:8000/tests/config/status?configId=${configid}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            console.log("PODACI PROMENJENI: ", data);
            if (data.status === 'OBRADA') {
                setIsConfigInprogress(true)
                setConfigName(data.name);
                setTestNo(data.test_no);
                setTestFiles(data.testConfigs || []);
            } else if (data.status === 'ZAVRSEN') {
                setConfigName(data.name);
                setTestNo(data.test_no);
                setConfigCompleted(true);
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
        formData.append('subjectId', id);
        formData.append('configName', configName); 
        formData.append('testNo', parseInt(testNo));

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

        if (!file) {
            toast.error("Nema datoteke za učitavanje. Molimo odaberite .zip datoteku.");
            setIsLoading(false);
            return;
        }

        console.log("COMPLETE CONFIGURATION: ", file, configid, testsConfig, id, configName, testNo);
        const formData = new FormData();
        formData.append('solutionZIP', file);
        formData.append('configid', configid);
        formData.append('testsConfig', JSON.stringify(testsConfig));
        formData.append('subjectId', id);
        formData.append('configName', configName);
        formData.append('testNo', testNo);

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
                    setConfigCompleted(true);
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
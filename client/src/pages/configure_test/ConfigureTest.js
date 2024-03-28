import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import UploadTab from '../../components/ConfigureTestTabs/UploadTab/UploadTab';

function ConfigureTest() {
    const { id, configid } = useParams();
    const [targetZIP, setTargetZIP] = useState(null);
    const [fileName, setFileName] = useState("");
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (configid) {
            setActiveTab('configure');
        } else {
            setActiveTab('upload');
        }

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
            }
        ]);
    }, [targetZIP, isLoading, configid]);

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
        .then(data => {
            setIsLoading(false);
            if (data.configid) {
                toast.success('Uspešno otpremljeno i otpakovano!');
                navigate(`./${data.configid}`);
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
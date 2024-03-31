import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './manageTestConfigurations.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import TestConfigurationCard from '../../components/TestConfigurationCard/TestConfigurationCard';

const ManageTestConfigurations = () => {
    const { id } = useParams();
    const [testConfigs, setTestConfigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestConfigurations = async () => {
            setIsLoading(true);
            
            try {
                const response = await fetch(`http://localhost:8000/tests/config/get_subject`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ subjectId: id }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.message !== "/"){
                    setTestConfigs(data);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                toast.error("Neuspješno učitavanje konfiguracija testova.");
                setError(err.message);
                setIsLoading(false);
            }
        };
    
        fetchTestConfigurations();
    }, [id]);

    const handleDeleteSuccess = (deletedConfigId) => {
        setTestConfigs(testConfigs.filter(config => config.id !== deletedConfigId));
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading test configurations: {error}</p>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            
            <div className='content'>
                <h1>Upravljanje konfiguracijama</h1>

                <div className='test-configurations'>
                    {testConfigs.length > 0 ? (
                        testConfigs.map((config) => (
                            <TestConfigurationCard key={config.id} testConfig={config} onDeleteSuccess={handleDeleteSuccess} />
                        ))
                    ) : (
                        <p>Nema konfiguracija testova za ovaj predmet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageTestConfigurations;

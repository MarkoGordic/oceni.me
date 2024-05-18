import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './subjectTests.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';
import TestCard from '../../components/TestCard/TestCard';

const SubjectTests = () => {
    const { id } = useParams();
    const [testsData, setTestsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTestsData = async () => {
            setIsLoading(true);
            
            try {
                const response = await fetch(`http://localhost:8000/tests/all`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ subjectId: id }),
                });
                if (!response.ok) {
                    toast.error("Neuspješno učitavanje konfiguracija testova.");
                }
                const data = await response.json();
                if (data.message !== "/"){
                    setTestsData(data);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                toast.error("Neuspješno učitavanje konfiguracija testova.");
                setIsLoading(false);
            }
        };
    
        fetchTestsData();
    }, [id]);

    const handleDeleteSuccess = (deletedConfigId) => {
        setTestsData(testsData.filter(config => config.id !== deletedConfigId));
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            
            <div className='content'>
                <h1>Upravljanje kolokvijumima</h1>

                <div className='test-configurations'>
                    {testsData.length > 0 ? (
                        testsData.map((config) => (
                            <TestCard key={config.id} testData={config} onDeleteSuccess={handleDeleteSuccess} />
                        ))
                    ) : (
                        <p>Nema kolokvijuma za ovaj predmet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubjectTests;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';

const ConfigComplete = ({ isLoading, setIsLoading, isCompleted}) => {
    const { configid } = useParams();
    const navigate = useNavigate();
    const [configuration, setConfiguration] = useState([]);

    const fetchTestConfig = () => {
        setIsLoading(true);

        fetch(`http://localhost:8000/tests/config/get?configId=${configid}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setIsLoading(false);
            setConfiguration(JSON.parse(data.test_configs) || [])
        })
        .catch(error => {
            console.error('Error:', error);
            toast.error('Došlo je do greške prilikom komunikacije sa serverom. Tražena konfiguracija nije pronađena.');
            setIsLoading(false);
        });
    };

    useEffect(() => {
        if(isCompleted)
            fetchTestConfig();
    }, [configid, isCompleted]);

    useEffect(() => {
        if (configuration.length > 0) {
            setIsLoading(false);
        }
        console.log(configuration);
    }, [configuration]);

    const handleFinish = () => {
        navigate('./../../configurations');
    };

    const handleDownload = () => {
        const downloadUrl = `http://localhost:8000/tests/config/download/${configid}`;
        window.open(downloadUrl, '_blank').focus();
    };

    const renderTable = () => {
        return (
            <table className="config-table">
                <thead>
                    <tr>
                        <th>Zadatak</th>
                        <th>Test</th>
                        <th>Ulaz</th>
                        <th>Bodovi</th>
                        <th>Izlaz</th>
                    </tr>
                </thead>
                <tbody>
                    {configuration.map(folder => folder.files.map(file => (
                        <tr key={file.name}>
                            <td>{folder.folder}</td>
                            <td>{file.name}</td>
                            <td>{file.content}</td>
                            <td>{file.points}</td>
                            <td>{file.result}</td>
                        </tr>
                    )))}
                </tbody>
            </table>
        );
    };

    return (
        isLoading ? (
            <div className="loader">Loading...</div>
        ) : (
            <div className="config-wrap">
                <h1 style={{margin: "0"}}>Konfiguracija je završena</h1>
                <h3 style={{margin: "0", marginBottom: '10px'}}>ID Konfiguracije : {configid}</h3>
                <p className='newtest-warning'>Prikaz ulaza i izlaza je opisnog karaktera i ne reflektuje stvarno stanje!</p>
                {renderTable()}

                <div className='config-finish-buttons'>
                    <button className="confirm-tests-btn" onClick={handleDownload}>PREUZMI</button>
                    <button className="confirm-tests-btn" onClick={handleFinish}>ZAVRŠI</button>
                </div>
            </div>
        )
    );
};

export default ConfigComplete;

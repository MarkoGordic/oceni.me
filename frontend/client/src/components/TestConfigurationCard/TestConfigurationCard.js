import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function TestConfigurationCard({ testConfig, onDeleteSuccess }) {
    const { id, name, test_configs, created_at, employee_id } = testConfig;
    const testsConfigParsed = JSON.parse(test_configs);
    const navigate = useNavigate();

    let folderCount = 0;
    let fileCount = 0;

    testsConfigParsed.forEach(folder => {
        folderCount += 1;
        fileCount += folder.files.length;
    });

    const date = new Date(created_at);

    const formattedDate = date.toLocaleDateString('sr-Latn-RS', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('sr-Latn-RS', {
        hour: '2-digit', minute: '2-digit'
    });

    const handleDownloadClick = () => {
        const downloadUrl = `http://localhost:8000/tests/config/download/${id}`;
        window.open(downloadUrl, '_blank').focus();
    };
    
    const handleDeleteClick = async () => {
        try {
            const response = await fetch(`http://localhost:8000/tests/config/delete/${id}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                toast.success('Konfiguracija uspešno obrisana.');
                onDeleteSuccess(id);
            } else {
                toast.error('Došlo je do greške prilikom brisanja konfiguracije.');
            }
        } catch (error) {
            toast.error('Došlo je do greške prilikom komunikacije sa serverom.');
        }
    };

    const handlePreview = (configId) => {
        navigate('./../configure/' + configId);
    };

    return (
        <div className='test-configuration-card'>
            <img src={`http://localhost:8000/user_pfp/${employee_id}.jpg`} alt='User' />
            <div className='test-configuration-card-info'>
                <p className='test-configuration-card-name'>{name}</p>
                <p className='test-configuration-card-total'>Ukupan broj zadataka (testova): {folderCount} ({fileCount})</p>
                <p className='test-configuration-card-date'>Kreirano: {formattedDate} {formattedTime}</p>
            </div>
            
            <div className='test-configuration-card-actions'>
                <button className='test-configuration-card-action' onClick={() => handlePreview(id)}><i className="fi fi-rr-eye"></i></button>
                <button className='test-configuration-card-action' onClick={handleDownloadClick}><i className="fi fi-rr-download"></i></button>
                <button className='test-configuration-card-action' onClick={handleDeleteClick}><i className="fi fi-rr-trash"></i></button>
            </div>
        </div>
    );
}

export default TestConfigurationCard;

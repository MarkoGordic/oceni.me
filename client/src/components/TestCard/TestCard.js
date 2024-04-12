import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function TestCard({ testData, onDeleteSuccess }) {
    console.log(testData);
    const { id, name, employee_id, total_tasks, total_tests, total_points, created_at } = testData;
    const navigate = useNavigate();

    const date = new Date(created_at);

    const formattedDate = date.toLocaleDateString('sr-Latn-RS', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('sr-Latn-RS', {
        hour: '2-digit', minute: '2-digit'
    });

    const handlePreview = (configId) => {
        navigate('./' + configId);
    };

    return (
        <div className='test-configuration-card'>
            <img src={`http://localhost:8000/user_pfp/${employee_id}.jpg`} alt='User' />
            <div className='test-configuration-card-info'>
                <p className='test-configuration-card-name'>{name}</p>
                <p className='test-configuration-card-total'>Ukupan broj zadataka/testova/poena: {total_tasks} | {total_tests} | {total_points}</p>
                <p className='test-configuration-card-date'>Kreirano: {formattedDate} {formattedTime}</p>
            </div>
            
            <div className='test-configuration-card-actions'>
                <button className='test-configuration-card-action' onClick={() => handlePreview(id)}><i className="fi fi-br-menu-burger"></i></button>
                <button className='test-configuration-card-action' ><i className="fi fi-sr-play"></i></button>
                <button className='test-configuration-card-action' ><i className="fi fi-rr-trash"></i></button>
            </div>
        </div>
    );
}

export default TestCard;

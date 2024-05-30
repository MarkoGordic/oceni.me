import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function TestCard({ testData, onDeleteSuccess }) {
    const navigate = useNavigate();
    const { id, name, employee_id, total_tasks, total_tests, total_points, created_at } = testData;

    const date = new Date(created_at);
    const formattedDate = date.toLocaleDateString('sr-Latn-RS', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('sr-Latn-RS', {
        hour: '2-digit', minute: '2-digit'
    });

    const handlePreview = () => {
        navigate(`./${id}`);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8000/tests/delete/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Test je uspešno obrisan.');
                onDeleteSuccess(id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            toast.error('Došlo je do greške prilikom brisanja testa.');
        }
    };

    return (
        <div className='test-configuration-card' onClick={handlePreview}>
            <img src={`http://localhost:8000/user_pfp/${employee_id}.jpg`} alt='User' />
            <div className='test-configuration-card-info'>
                <p className='test-configuration-card-name'>{name}</p>
                <p className='test-configuration-card-total'>Zadataka/Testova/Bodova: {total_tasks} | {total_tests} | {total_points}</p>
                <p className='test-configuration-card-date'>Kreirano: {formattedDate} {formattedTime}</p>
            </div>
            
            <div className='test-configuration-card-actions'>
                <button className='test-configuration-card-action' onClick={handlePreview}><i className="fi fi-br-menu-burger"></i></button>
                <button className='test-configuration-card-action' onClick={handleDelete}><i className="fi fi-rr-trash"></i></button>
            </div>
        </div>
    );
}

export default TestCard;

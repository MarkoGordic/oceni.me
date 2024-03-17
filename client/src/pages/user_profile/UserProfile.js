import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import './userProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        id: ''
    });

    const [changes, setChanges] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/employees/me', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                setUser({
                    firstName: data.first_name,
                    lastName: data.last_name,
                    email: data.email,
                    id: data.id
                });
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Došlo je do greške prilikom učitavanja podataka.');
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setChanges(prev => ({ ...prev, [name]: value }));
    };

    const handleUserUpdate = () => {
        if (Object.keys(changes).length === 0) {
            toast.info('Niste uneli nikakve izmene.');
            return;
        }

        fetch('http://localhost:8000/employees/me/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changes),
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            toast.success("Vaši podaci su uspešno ažurirani.");
            setUser(user => ({ ...user, ...changes }));
            setChanges({});
        })
        .catch(error => {
            toast.error("Neuspešno ažuriranje podataka.");
        });
    };

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <Sidebar />
            <div className='content'>
                <h1>Korisnička Zona</h1>
                <div className='userinfo-wrap1'>
                    <img src={'http://localhost:8000/user_pfp/' + user.id + '.jpg'} alt="User Avatar" />
                    <div className='userinfo-details'>
                        <p className='userinfo-fullname'>{user.firstName} {user.lastName}</p>
                        <p className='userinfo-email'>{user.email}</p>
                    </div>
                </div>
                <div className='userinfo-edit'>
                    <h2>Izmeni podatke</h2>
                    <div className='userInfo-editwrap'>
                        <label className='studentInfo-label' htmlFor="firstName">Ime:</label>
                        <input className='studentInfo-input' type="text" id="firstName" name="firstName" defaultValue={user.firstName} onChange={handleInputChange} />

                        <label className='studentInfo-label' htmlFor="lastName">Prezime:</label>
                        <input className='studentInfo-input' type="text" id="lastName" name="lastName" defaultValue={user.lastName} onChange={handleInputChange} />

                        <label className='studentInfo-label' htmlFor="email">Elektronska pošta:</label>
                        <input className='studentInfo-input' type="email" id="email" name="email" defaultValue={user.email} onChange={handleInputChange} />

                        <button className='userinfo-editbtn' onClick={handleUserUpdate}><i class="fi fi-rr-disk"></i> SAČUVAJ IZMENE</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

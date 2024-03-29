import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import './userProfile.css';
import { useUser } from '../../contexts/UserContext';

const UserProfile = () => {
    const { user, setUser } = useUser();

    const [changes, setChanges] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');

    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);

    const togglePasswordVisibility = (passwordType) => {
        if (passwordType === 'old') setIsOldPasswordVisible(!isOldPasswordVisible);
        if (passwordType === 'new') setIsNewPasswordVisible(!isNewPasswordVisible);
        if (passwordType === 'confirmNew') setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible);
    };

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

    const handlePasswordUpdate = () => {
        if (newPassword !== confirmNewPassword) {
            toast.error('Nova lozinka i potvrda lozinke se ne podudaraju.');
            return;
        }

        fetch('http://localhost:8000/employees/reset_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword
            }),
            credentials: 'include',
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Problem with response');
        })
        .then(data => {
            toast.success("Vaša lozinka je uspešno promenjena.");
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        })
        .catch(error => {
            console.error('Error:', error);
            toast.error("Neuspešna promena lozinke.");
        });
    };

    const triggerProfileImageUpload = () => {
        document.getElementById('profileImageInput').click();
    };
    
    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_image', file);
    
            fetch('http://localhost:8000/employees/me/update_pfp', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Problem with response');
            })
            .then(data => {
                toast.success("Vaša profilna slika je uspešno ažurirana.");
                setUser(prevUser => ({
                    ...prevUser,
                    avatar: `http://localhost:8000/user_pfp/${prevUser.id}.jpg?${Date.now()}`
                }));
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error("Neuspešno ažuriranje profilne slike.");
            });
        }
    };

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <Sidebar />
            <div className='content'>
                <h1>Korisnička Zona</h1>
                <div className='userinfo-wrap1'>
                    <img src={user.avatar} alt="User Avatar" />
                    <div className='userinfo-details'>
                        <p className='userinfo-fullname'>{user.firstName} {user.lastName}</p>
                        <p className='userinfo-email'>{user.email}</p>
                        <input type="file" id="profileImageInput" hidden onChange={handleProfileImageChange} accept="image/*" />
                        <button className='userinfo-updateimage' onClick={triggerProfileImageUpload}>PROMENI SLIKU</button>
                    </div>
                </div>
                <div className='userinfo-edit'>
                    <div className='userInfo-editwrap'>
                        <h2>Izmeni podatke</h2>
                        <label className='studentInfo-label' htmlFor="firstName">Ime:</label>
                        <input className='studentInfo-input' type="text" id="firstName" name="firstName" defaultValue={user.firstName} onChange={handleInputChange} />

                        <label className='studentInfo-label' htmlFor="lastName">Prezime:</label>
                        <input className='studentInfo-input' type="text" id="lastName" name="lastName" defaultValue={user.lastName} onChange={handleInputChange} />

                        <label className='studentInfo-label' htmlFor="email">Elektronska pošta:</label>
                        <input className='studentInfo-input' type="email" id="email" name="email" defaultValue={user.email} onChange={handleInputChange} />

                        <button className='userinfo-editbtn' onClick={handleUserUpdate}><i className="fi fi-rr-disk"></i> SAČUVAJ IZMENE</button>
                    </div>

                    <div className='userInfo-editwrap'>
                        <h2>Promena lozinke</h2>

                        <label className='studentInfo-label' htmlFor="oldPassword">Stara lozinka:</label>
                        <div className="userinfo-password-input-group">
                            <input className='studentInfo-input' type={isOldPasswordVisible ? "text" : "password"} id="oldPassword" name="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            <span onClick={() => togglePasswordVisibility('old')} className="userinfo-eye-icon">
                                <i className={isOldPasswordVisible ? "fi fi-rr-eye-crossed" : "fi fi-rs-eye"}></i>
                            </span>
                        </div>

                        <label className='studentInfo-label' htmlFor="newPassword">Nova lozinka:</label>
                        <div className="userinfo-password-input-group">
                            <input className='studentInfo-input' type={isNewPasswordVisible ? "text" : "password"} id="newPassword" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <span onClick={() => togglePasswordVisibility('new')} className="userinfo-eye-icon">
                                <i className={isNewPasswordVisible ? "fi fi-rr-eye-crossed" : "fi fi-rs-eye"}></i>
                            </span>
                        </div>

                        <label className='studentInfo-label' htmlFor="confirmNewPassword">Potvrdi novu lozinku:</label>
                        <div className="userinfo-password-input-group">
                            <input className='studentInfo-input' type={isConfirmNewPasswordVisible ? "text" : "password"} id="confirmNewPassword" name="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                            <span onClick={() => togglePasswordVisibility('confirmNew')} className="userinfo-eye-icon">
                                <i className={isConfirmNewPasswordVisible ? "fi fi-rr-eye-crossed" : "fi fi-rs-eye"}></i>
                            </span>
                        </div>

                        <button className='userinfo-editbtn' onClick={handlePasswordUpdate}><i className="fi fi-rr-disk"></i> PROMENI LOZINKU</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

import React, { useState, useEffect } from 'react';
import './subjectSidebar.css';
import SidebarRoute from '../SidebarRoute/SidebarRoute';
import { toast } from 'react-toastify';

function SubjectSidebar() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        avatar: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:8000/employees/me', {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const userData = await response.json();
                setUser({
                    name: userData.first_name + ' ' + userData.last_name,
                    email: userData.email,
                    avatar: userData.avatar,
                    id: userData.id
                });
            } catch (error) {
                console.error('There was a problem fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="sidebar">
            <div className='sidebar-app-logo'>
                <h1>oceni.me</h1>
            </div>

            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-bs-home' text='Pregled predmeta' path='./overview' />
                <SidebarRoute icon='fi fi-rr-list-check' text='Kolokvijumi' path='./tests' />
                <SidebarRoute icon='fi fi-br-plus' text='Novi kolokvijum' path='./tests/new' />
                <SidebarRoute icon='fi fi-rs-users' text='Spisak studenata' path='./students' />
            </div>
            
            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-sr-time-past' text='Istorija aktivnosti' path='./logs' />
                <SidebarRoute icon='fi fi-rs-shield' text='Upravljaj predmetom' path='./manage' />
            </div>

            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-br-exit' text='Napusti predmet' path='/subjects' />
            </div>

            <div className='sidebar-user-wrap'>

                <div className='sidebar-user'>
                    <img src={'http://localhost:8000/user_pfp/' + user.id + '.jpg'} alt="User Avatar" className='sidebar-user-avatar'></img>
                    <div className='sidebar-user-details'>
                        <p className='sidebar-user-name'>{user.name}</p>
                        <p className='sidebar-user-email'>{user.email}</p>
                    </div>
                </div>

                <div className='sidebar-delim'></div>

                <div className='logout-route'>
                    <i className='fi fi-rr-exit'></i>
                    <a className='sidebar-route-text' href='http://localhost:8000/auth/logout'>Odjavi se</a>
                </div>
            </div>
        </div>
    );
}

export default SubjectSidebar;

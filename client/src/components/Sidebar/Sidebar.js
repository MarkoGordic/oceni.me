import React, { useState, useEffect } from 'react';
import './sidebar.css';
import SidebarRoute from '../SidebarRoute/SidebarRoute';
import { useUser } from '../../contexts/UserContext';

function Sidebar() {
    const { user } = useUser();

    return (
        <div className="sidebar">
            <div className='sidebar-app-logo'>
                <h1>oceni.me</h1>
            </div>

            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-bs-home' text='Početna stranica' path='/app' />
                <SidebarRoute icon='fi fi-rs-book-alt' text='Moji predmeti' path='/subjects' />
                <SidebarRoute icon='fi fi-rs-users' text='Upravljanje studentima' path='/manage_students' />
                <SidebarRoute icon='fi fi-bs-user' text='Korisnička zona' path='/profile' />
            </div>
            
            {user.role === 0 && (
                <div className='sidebar-delim'></div>
            )}

            {user.role === 0 && (
                <div className='sidebar-routes'>
                    <SidebarRoute icon='fi fi-rr-fingerprint' text='Upravljanje zaposlenima' path='/admin/users' />
                    <SidebarRoute icon='fi fi-rr-graduation-cap' text='Upravljanje predmetima' path='/admin/subjects' />
                    <SidebarRoute icon='fi fi-sr-time-past' text='Istorija aktivnosti' path='/admin/logs' />
                </div>
            )}

            <div className='sidebar-user-wrap'>

                <div className='sidebar-user'>
                    <img src={user.avatar} alt="User Avatar" className='sidebar-user-avatar'></img>
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

export default Sidebar;

import React, { useState, useEffect } from 'react';
import './subjectSidebar.css';
import SidebarRoute from '../SidebarRoute/SidebarRoute';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

function SubjectSidebar() {
    const { user } = useUser();

    const location = useLocation();
    const subjectId = location.pathname.split('/')[2] || 'defaultSubjectId';

    const basePath = `/subjects/${subjectId}`;

    return (
        <div className="sidebar">
            <div className='sidebar-app-logo'>
                <h1>oceni.me</h1>
            </div>

            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-bs-home' text='Pregled predmeta' path={`${basePath}/overview`} />
                <SidebarRoute icon='fi fi-rr-list-check' text='Kolokvijumi' path={`${basePath}/tests`} exact/>
                <SidebarRoute icon='fi fi-br-plus' text='Novi kolokvijum' path={`${basePath}/tests/new`} />
                <SidebarRoute icon='fi fi-ss-settings' text='Konfiguracije' path={`${basePath}/tests/configurations`} />
                <SidebarRoute icon='fi fi-sr-add-document' text='Kreiraj konfiguraciju' path={`${basePath}/tests/configure`} />
                <SidebarRoute icon='fi fi-rs-users' text='Spisak studenata' path={`${basePath}/students`} />
            </div>
            
            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-rs-shield' text='Upravljaj predmetom' path={`${basePath}/manage`} />
            </div>

            <div className='sidebar-delim'></div>

            <div className='sidebar-routes'>
                <SidebarRoute icon='fi fi-br-exit' text='Napusti predmet' path='/subjects' exact/>
            </div>

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

export default SubjectSidebar;

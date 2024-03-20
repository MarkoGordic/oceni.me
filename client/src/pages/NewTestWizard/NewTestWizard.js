import React from "react";
import { toast, ToastContainer } from 'react-toastify';
import './newTestWizard.css';
import SubjectSidebar from '../../components/SubjectSidebar/SubjectSidebar';

const NewTestWizard = () => {
    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <SubjectSidebar />
            <div className='content'>
                <div className="newtest-wrap">
                    <h1>Dodavanje novog kolokvijuma</h1>
                    <p className="newtest-info">Dobrodošli u čarobnjak za dodavanje novog kolokvijuma. Čarobnjak će Vas voditi kroz korake za dodavanje svih potrebnih informacija o kolokvijumu.</p>
                    <p className="newtest-warning">UPOZORENJE: Ovaj proces može potrajati nekoliko minuta. Molimo Vas da ne zatvarate ovu stranicu dok se proces ne završi.</p>
                </div>
            </div>
        </div>
    );
};

export default NewTestWizard;
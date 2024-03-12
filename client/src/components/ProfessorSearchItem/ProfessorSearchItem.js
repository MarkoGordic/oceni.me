import React from 'react';
import './professorSearchItem.css';

function ProfessorSearchItem({ professor, onSelect }) {
    return (
        <div className="professor-item" onClick={() => onSelect(professor)}>
            <img src={'http://localhost:8000/user_pfp/' + professor.id + '.jpg'} alt="professor" className="professor-profile-image"/>
            <p>{professor.first_name} {professor.last_name}</p>
        </div>
    );
}

export default ProfessorSearchItem;
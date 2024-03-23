import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './newEmployeeModal.css';

const customSelectStyles = {
    control: (styles, { isFocused }) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: isFocused ? '#1993F0' : '#333333',
        color: '#F7F7FF',
        width: '100%',
        minHeight: '40px',
        '&:hover': { borderColor: isFocused ? '#1993F0' : '#555555' },
        boxShadow: 'none',
        borderRadius: '5px',
        marginBottom: '10px',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        color: '#F7F7FF',
        width: '100%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        borderRadius: '5px',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#1993F0' : isFocused ? '#2C2B2B' : undefined,
        color: '#F7F7FF',
        '&:active': { backgroundColor: '#1668B2', color: '#F7F7FF' },
        padding: '10px',
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        '&:hover': { color: '#AAD1F9' },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: '#1993F0',
    }),
    placeholder: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        opacity: 0.7,
    }),
    input: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    noOptionsMessage: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    menuList: (styles) => ({
        ...styles,
        padding: 0,
    }),
};

function NewEmployeeModal({ isOpen, onClose, onSubmit, employeeData, onInputChange, onSelectRoleChange }) {
    const animatedComponents = makeAnimated();
    const wrapperRef = useRef(null);

    if (!isOpen) return null;

    const roleOptions = [
        { value: 1, label: 'Profesor' },
        { value: 2, label: 'Asistent' },
        { value: 3, label: 'Demonstrator' },
    ];
    return (
        <div className="new-employee-modal-overlay" onClick={onClose}>
            <div className="new-employee-modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={onSubmit}>
                    <h2>Dodaj novog zaposlenog</h2>
                    
                    <label htmlFor="profile_image">Fotografija zaposlenog:</label>
                    <input type="file" id="profile_image" onChange={onInputChange} />

                    <label htmlFor="subject_name">Ime:</label>
                    <input id="subject_name" type="text" name="first_name" placeholder="Petar" value={employeeData.first_name} onChange={onInputChange} />

                    <label htmlFor="subject_code">Prezime:</label>
                    <input id="subject_code" type="text" name="last_name" placeholder="Petrović" value={employeeData.last_name} onChange={onInputChange} />

                    <label htmlFor="email">Elektronska pošta:</label>
                    <input type="email" id="email" placeholder="primer.tidajem@uns.ac.rs" name="email" value={employeeData.email} onChange={onInputChange} required />

                    <label htmlFor="password">Početna lozinka:</label>
                    <input type="password" id="password" placeholder="MnogoJakaSifra" name="password" value={employeeData.password} onChange={onInputChange} required />


                    <div className="selects-container">
                        <div className="select-employee-role">
                            <label htmlFor="course">Odabir pozicije</label>
                            <Select
                                    id="course"
                                    components={animatedComponents}
                                    options={roleOptions}
                                    styles={customSelectStyles}
                                    placeholder="Pozicija"
                                    isClearable={true}
                                    className="employee-role-select"
                                    onChange={onSelectRoleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-action-buttons">
                        <button type="submit" className="submit-button">Sačuvaj izmene</button>
                        <button type="button" className="cancel-button" onClick={onClose}>Odustani</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewEmployeeModal;

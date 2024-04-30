import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import './modifySubjectModal.css';
import makeAnimated from 'react-select/animated';
import ProfessorSearchItem from '../ProfessorSearchItem/ProfessorSearchItem';

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
        width: 'auto',
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

function ModifySubjectModal({ isOpen, onClose, subject_id, onSubjectUpdated }) {
    const [professorSearchTerm, setProfessorSearchTerm] = useState('');
    const [professorResults, setProfessorResults] = useState([]);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [selectedYearOption, setSelectedYearOption] = useState(null);
    const [selectedCourseOption, setSelectedCourseOption] = useState(null);
    const wrapperRef = useRef(null);
    const animatedComponents = makeAnimated();
    const [subjectData, setSubjectData] = useState({
        name: '',
        code: '',
        professor_id: '',
        course_code: '',
        year: '',
        subject_id: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let i = currentYear; i >= 1950; i--) {
            options.push({ value: i.toString(), label: i.toString() });
        }
        return options;
    };

    const yearOptions = getYearOptions();

    const courseOptions = [
        { value: 'MR', label: 'Magistarske studije' },
        { value: 'XA', label: 'Arhitektura i urbanizam (INTEGRISANE STUDIJE)' },
        { value: 'XE', label: 'Elektrotehnika i računarstvo (INTEGRISANE STUDIJE)' },
        { value: 'XO', label: 'Geodezija i geomatika (INTEGRISANE STUDIJE)' },
        { value: 'XG', label: 'Građevinarstvo (INTEGRISANE STUDIJE)' },
        { value: 'XF', label: 'Grafičko inženjerstvo i dizajn (INTEGRISANE STUDIJE)' },
        { value: 'XI', label: 'Industrijsko inženjerstvo i menadžment (INTEGRISANE STUDIJE)' },
        { value: 'XZ', label: 'Inženjerstvo zaštite životne sredine i zaštite na radu (INTEGRISANE STUDIJE)' },
        { value: 'XM', label: 'Mašinstvo (INTEGRISANE STUDIJE)' },
        { value: 'XH', label: 'Mehatronika (INTEGRISANE STUDIJE)' },
        { value: 'XS', label: 'Saobraćaj (INTEGRISANE STUDIJE)' },
        { value: 'AI', label: 'Animacija u inženjerstvu (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'AR', label: 'Arhitektura (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'AU', label: 'Arhitektura i urbanizam (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'BI', label: 'Biomedicinsko inženjerstvo (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'GT', label: 'Čiste energetske tehnologije (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'E3', label: 'Elektroenergetski softverski inženjering (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ME', label: 'Energetika i procesna tehnika (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'EE', label: 'Energetika, elektronika i telekomunikacije (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'GE', label: 'Geodezija i geoinformatika (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'GG', label: 'Geodezija i geomatika (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'GR', label: 'Građevinarstvo (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'GI', label: 'Grafičko inženjerstvo i dizajn (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'II', label: 'Industrijsko inženjerstvo (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'IN', label: 'Informacioni inženjering (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'IM', label: 'Inženjerski menadžment (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'IT', label: 'Inženjerstvo informacionih sistema (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ZR', label: 'Inženjerstvo zaštite na radu (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ZZ', label: 'Inženjerstvo zaštite životne sredine (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'MM', label: 'Mehanizacija i konstrukciono mašinstvo (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'MH', label: 'Mehatronika (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'EM', label: 'Merenje i regulacija (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'SP', label: 'Poštanski saobraćaj i telekomunikacije (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'PR', label: 'Primenjeno softversko inženjerstvo (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'MP', label: 'Proizvodno mašinstvo (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'RA', label: 'Računarstvo i automatika (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ST', label: 'Saobraćaj i transport (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'SA', label: 'Scenska arhitektura, tehnika i dizajn (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'SL', label: 'Softversko inženjerstvo i informacione tehnologije - Loznica (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'SV', label: 'Softversko inženjerstvo i informacione tehnologije (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'SW', label: 'Softversko inženjerstvo i informacione tehnologije (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ER', label: 'Studenti na razmeni' },
        { value: 'MT', label: 'Tehnička mehanika i dizajn u tehnici (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ZK', label: 'Upravljanje rizikom od katastrofalnih događaja i požara (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ZU', label: 'Upravljanje rizikom od katastrofalnih događaja i požara (OSNOVNE AKADEMSKE STUDIJE)' },
        { value: 'ES', label: 'Elektroenergetika - obnovljivi izvori električne energije (OSNOVNE STRUKOVNE STUDIJE)' },
        { value: 'ET', label: 'Elektronika i telekomunikacije (OSNOVNE STRUKOVNE STUDIJE)' },
        { value: 'EL', label: 'Elektrotehnika (OSNOVNE STRUKOVNE STUDIJE)' },
        { value: 'SF', label: 'Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE)' },
        { value: 'SR', label: 'Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE)' },
        { value: 'RS', label: 'Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE) - Inđija' },
        { value: 'LO', label: 'Softverske i informacione tehnologije (OSNOVNE STRUKOVNE STUDIJE) - Loznica' },
        { value: 'F2', label: 'Animacija u inženjerstvu (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A7', label: 'Arhitektura (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A1', label: 'Arhitektura i urbanizam (MASTER AKADEMSKE STUDIJE)' },
        { value: 'B1', label: 'Biomedicinsko inženjerstvo (MASTER AKADEMSKE STUDIJE)' },
        { value: 'C1', label: 'Čiste energetske tehnologije (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A8', label: 'Digitalne tehnike, dizajn i produkcija u arhitekturi (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A4', label: 'Digitalne tehnike, dizajn i produkcija u aritekturi i urbanizmu (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E4', label: 'Elektroenergetski softverski inženjering (MASTER AKADEMSKE STUDIJE)' },
        { value: 'M3', label: 'Energetika i procesna tehnika (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E1', label: 'Energetika, elektronika i telekomunikacije (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I3', label: 'Energetski menadžment (MASTER AKADEMSKE STUDIJE)' },
        { value: 'O2', label: 'Geodezija i geoinformatika (MASTER AKADEMSKE STUDIJE)' },
        { value: 'O1', label: 'Geodezija i geomatika (MASTER AKADEMSKE STUDIJE)' },
        { value: 'G1', label: 'Građevinarstvo (MASTER AKADEMSKE STUDIJE)' },
        { value: 'F1', label: 'Grafičko inženjerstvo i dizajn (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I5', label: 'Industrijsko inženjerstvo - Napredne inženjerske tehnologije (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I4', label: 'Industrijsko inženjerstvo - Razvoj i upravljanje životnih ciklusa proizvoda (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I1', label: 'Industrijsko inženjerstvo (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I9', label: 'Informaciona bezbednost (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E6', label: 'Informacioni i analitički inženjering (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E7', label: 'Informacioni inženjering (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I2', label: 'Inženjerski menadžment (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I7', label: 'Inženjerstvo informacionih sistema (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I8', label: 'Inženjerstvo inovacija (MASTER AKADEMSKE STUDIJE)' },
        { value: 'Z4', label: 'Inženjerstvo tretmana i zaštite voda (MASTER AKADEMSKE STUDIJE)' },
        { value: 'Z3', label: 'Inženjerstvo tretmana i zaštite voda (TEMPUS MASTER AKADEMSKE STUDIJE)' },
        { value: 'Z2', label: 'Inženjerstvo zaštite na radu (MASTER AKADEMSKE STUDIJE)' },
        { value: 'Z1', label: 'Inženjerstvo zaštite životne sredine (MASTER AKADEMSKE STUDIJE)' },
        { value: 'I6', label: 'Logističko inženjerstvo i menadžment (MASTER AKADEMSKE STUDIJE)' },
        { value: 'V1', label: 'Matematika u tehnici (MASTER AKADEMSKE STUDIJE)' },
        { value: 'V2', label: 'Matematika u tehnici (MASTER AKADEMSKE STUDIJE)' },
        { value: 'M2', label: 'Mehanizacija i konstrukciono mašinstvo (MASTER AKADEMSKE STUDIJE)' },
        { value: 'H1', label: 'Mehatronika (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E8', label: 'Merenje i regulacija (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A3', label: 'Planiranje i upravljanje regionalnim razvojom (MASTER AKADEMSKE STUDIJE)' },
        { value: 'S2', label: 'Poštanski saobraćaj i telekomunikacije (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E5', label: 'Primenjeno softversko inženjerstvo (MASTER AKADEMSKE STUDIJE)' },
        { value: 'M1', label: 'Proizvodno mašinstvo (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E2', label: 'Računarstvo i automatika (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A2', label: 'Regionalna politika i razvoj (MASTER AKADEMSKE STUDIJE)' },
        { value: 'S1', label: 'Saobraćaj i transport (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A5', label: 'Scenska arhitektura i dizajn (MASTER AKADEMSKE STUDIJE)' },
        { value: 'A6', label: 'Scenska arhitektura i tehnika (MASTER AKADEMSKE STUDIJE)' },
        { value: 'R1', label: 'Softversko inženjerstvo i informacione tehnologije (MASTER AKADEMSKE STUDIJE)' },
        { value: 'R2', label: 'Softversko inženjerstvo i informacione tehnologije (MASTER AKADEMSKE STUDIJE)' },
        { value: 'M4', label: 'Tehnička mehanika i dizajn u tehnici (MASTER AKADEMSKE STUDIJE)' },
        { value: 'ZP', label: 'Upravljanje rizikom od katastrofalnih događaja i požara (MASTER AKADEMSKE STUDIJE)' },
        { value: 'E9', label: 'Veštačka inteligencija i mašinsko učenje (MASTER AKADEMSKE STUDIJE)' },
        { value: 'AJ', label: 'Specijalističke akademske studije - Arhitektura' },
        { value: 'AS', label: 'Specijalističke akademske studije - Arhitektura i urbanizam (dvogodišnje studije)' },
        { value: 'EJ', label: 'Specijalističke akademske studije - Energetika, elektronika i telekomunikacije' },
        { value: 'TS', label: 'Specijalističke akademske studije - Energetika, elektronika i telekomunikacije  (dvogodišnje studije)' },
        { value: 'OJ', label: 'Specijalističke akademske studije - Geodezija i geomatika' },
        { value: 'NJ', label: 'Specijalističke akademske studije - Industrijsko inženjerstvo' },
        { value: 'ID', label: 'Specijalističke akademske studije - Inženjerski menadžment' },
        { value: 'IJ', label: 'Specijalističke akademske studije - Inženjerski menadžment' },
        { value: 'IS', label: 'Specijalističke akademske studije - Inženjerski menadžment  (dvogodišnje studije)' },
        { value: 'ZJ', label: 'Specijalističke akademske studije - Inženjerstvo zaštite životne sredine' },
        { value: 'ZS', label: 'Specijalističke akademske studije - Inženjerstvo zaštite životne sredine  (dvogodišnje studije)' },
        { value: 'SS', label: 'Specijalističke akademske studije - Saobraćaj' },
        { value: 'EF', label: 'Specijalističke akademske studije- Energetska efikasnost u zgradarstvu' },
        { value: 'MB', label: 'Specijalističke strukovne studije - MBA' },
        { value: 'SE', label: 'Strukovne specijalističke studije - Energetika, elektronika i telekomunikacije' },
        { value: 'SI', label: 'Strukovne specijalističke studije - Inženjerski menadžment' },
        { value: 'SZ', label: 'Strukovne specijalističke studije - Inženjerstvo zaštite životne sredine i bezbednosti i zaštite na radu' },
        { value: 'PE', label: 'Elektrotehnika (MASTER STRUKOVNE STUDIJE)' },
        { value: 'PI', label: 'Inženjerski menadžment MBA (MASTER STRUKOVNE STUDIJE)' },
        { value: 'PM', label: 'Proizvodno mašinstvo (MASTER STRUKOVNE STUDIJE)' },
        { value: 'DU', label: 'Doktorske studije - Animacija u inženjerstvu' },
        { value: 'DC', label: 'Doktorske studije - Arhitektura' },
        { value: 'DA', label: 'Doktorske studije - Arhitektura i urbanizam' },
        { value: 'DL', label: 'Doktorske studije - Biomedicinsko inženjerstvo' },
        { value: 'DE', label: 'Doktorske studije - Energetika, elektronika i telekomunikacije' },
        { value: 'DJ', label: 'Doktorske studije - Geodezija i geoinformatika' },
        { value: 'DO', label: 'Doktorske studije - Geodezija i geomatika' },
        { value: 'DG', label: 'Doktorske studije - Građevinarstvo' },
        { value: 'DF', label: 'Doktorske studije - Grafičko inženjerstvo i dizajn' },
        { value: 'DI', label: 'Doktorske studije - Industrijsko inženjerstvo/Inženjerski menadžment' },
        { value: 'DV', label: 'Doktorske studije - Inženjerstvo informacionih sistema' },
        { value: 'DD', label: 'Doktorske studije - Inženjerstvo zaštite na radu' },
        { value: 'DZ', label: 'Doktorske studije - Inženjerstvo zaštite životne sredine' },
        { value: 'DM', label: 'Doktorske studije - Mašinstvo' },
        { value: 'DT', label: 'Doktorske studije - Matematika u tehnici' },
        { value: 'DH', label: 'Doktorske studije - Mehatronika' },
        { value: 'DP', label: 'Doktorske studije - Računarstvo i automatika' },
        { value: 'DS', label: 'Doktorske studije - Saobraćaj' },
        { value: 'DN', label: 'Doktorske studije - Scenski dizajn' },
        { value: 'DB', label: 'Doktorske studije - Tehnička mehanika' },
        { value: 'DK', label: 'Doktorske studije - Upravljanje rizikom od katastrofalnih događaja i požara' },
        { value: 'DR', label: 'Doktorske studije (studenti upisani od 2006 do 2010)' }
    ];

    useEffect(() => {
        if (isOpen && subject_id) {
            fetchSubjectData(subject_id);
        }
    }, [isOpen, subject_id]);

    async function fetchSubjectData(id) {
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8000/subjects/get/${id}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();

            setSubjectData({ 
              course_code: data.course_code, 
              year: data.year, 
              name: data.name, 
              code: data.code, 
              professor_id: data.professor_id,
              subject_id: data.id
            });

            const selectedYear = yearOptions.find(option => option.value === data.year.toString());
            const selectedCourse = courseOptions.find(option => option.value === data.course_code);
            setSelectedYearOption(selectedYear);
            setSelectedCourseOption(selectedCourse);

            if (data.professor_id) {
                const profResponse = await fetch(`http://localhost:8000/employees/get/${data.professor_id}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (profResponse.ok) {
                    const profData = await profResponse.json();
                    handleSelectProfessor(profData);
                }
            }
        } catch (error) {
            console.error("Error fetching subject data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSubjectData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const onSelectCourseChange = (selectedOption) => {
        setSubjectData(prevState => ({
            ...prevState,
            course_code: selectedOption ? selectedOption.value : ''
        }));
        setSelectedCourseOption(selectedOption);
    };

    const onSelectYearChange = (selectedOption) => {
        setSubjectData(prevState => ({
            ...prevState,
            year: selectedOption ? selectedOption.value : ''
        }));
        setSelectedYearOption(selectedOption);
    };

    const handleSelectProfessor = (professor) => {
        setSelectedProfessor(professor);
        setProfessorSearchTerm('');
        setProfessorResults([]);
        setSubjectData(prevState => ({
            ...prevState,
            professor_id: professor.id
        }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/subjects/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subjectData,),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update subject data');
            }

            toast.success("Predmet je uspešno ažuriran");
            onSubjectUpdated();
            onClose();
        } catch (error) {
            console.error("Error updating subject data:", error);
            toast.error("Došlo je do greške prilikom ažuriranja predmeta");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchProfessors = async () => {
            if (!professorSearchTerm) {
                setProfessorResults([]);
                return;
            }
    
            try {
                const response = await fetch(`http://localhost:8000/employees/search_professors?search=${professorSearchTerm}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setProfessorResults(data.slice(0, 10));
            } catch (error) {
                console.error('Error fetching professors:', error);
            }
        };
    
        fetchProfessors();
    }, [professorSearchTerm]);

    function useOutsideAlerter(ref, onOutsideClick) {
        useEffect(() => {
            function handleClickOutside(event) {
                if (ref.current && !ref.current.contains(event.target)) {
                    onOutsideClick();
                }
            }
    
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [ref, onOutsideClick]);
    }

    useOutsideAlerter(wrapperRef, () => {
        if (isOpen) setProfessorResults([]);
    });

    if (!isOpen) return null;

    return (
        <div className="modify-subject-modal-overlay" onClick={onClose}>
            <div className="modify-subject-modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2>Izmena predmeta</h2>
                    <div className='modify-subject-input-wrap'>
                        <label htmlFor="name">Naziv predmeta</label>
                        <input id="name" type="text" name="name" placeholder="Unesite naziv predmeta" value={subjectData.name} onChange={handleInputChange} />

                        <label htmlFor="subject_code">Šifra predmeta</label>
                        <input id="subject_code" type="text" name="code" placeholder="Unesite šifru predmeta" value={subjectData.code} onChange={handleInputChange} />

                        <label>Odabir predmetnog profesora</label>
                        <div className="search-bar-modify-subject-modal" ref={wrapperRef} style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="search-input-modify-subject-modal"
                                placeholder="Pretražite profesora..."
                                value={professorSearchTerm}
                                onChange={(e) => setProfessorSearchTerm(e.target.value)}
                            />
                            {professorResults.length > 0 && (
                                <div className="professor-results-dropdown">
                                    {professorResults.map(professor => (
                                        <ProfessorSearchItem
                                            key={professor.id}
                                            professor={professor}
                                            onSelect={() => handleSelectProfessor(professor)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedProfessor ? (
                            <div className="selected-professor-display">
                                <img src={'http://localhost:8000/user_pfp/' + selectedProfessor.id + '.jpg'} alt="Selected professor" className="selected-professor-image"/>
                                <div className="selected-professor-info">
                                    <span>{selectedProfessor.first_name} {selectedProfessor.last_name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="selected-professor-placeholder">
                                Nema odabranog profesora
                            </div>
                        )}

                        <div className="selects-container">
                            <div className="select-course-and-year">
                                <label htmlFor="course">Studijski program i Godina upisa</label>
                                <div className="selects-row">
                                    <Select
                                        id="course"
                                        components={animatedComponents}
                                        options={courseOptions}
                                        styles={customSelectStyles}
                                        placeholder="Studijski program"
                                        isClearable={true}
                                        className="course-select"
                                        value={selectedCourseOption}
                                        onChange={onSelectCourseChange}
                                    />
                                    <Select
                                        id="year"
                                        components={animatedComponents}
                                        options={yearOptions}
                                        styles={customSelectStyles}
                                        placeholder="Godina"
                                        className="year-select"
                                        value={selectedYearOption}
                                        onChange={onSelectYearChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-action-buttons">
                        <button type="submit" className="submit-button" disabled={isLoading}>SAČUVAJ PROMENE</button>
                        <button type="button" className="cancel-button" onClick={onClose}>ODUSTANI</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModifySubjectModal;

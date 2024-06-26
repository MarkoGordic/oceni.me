import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './manageSubjects.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import SubjectContainer from '../../components/SubjectContainer/SubjectContainer';
import NewSubjectModal from '../../components/NewSubjectModal/NewSubjectModal';
import ModifySubjectModal from '../../components/ModifySubjectModal/ModifySubjectModal';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const customYearSelectStyles = {
    control: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: '#1993F0',
        color: '#F7F7FF',
        width: '135px',
        minHeight: '50px',
        '&:hover': { borderColor: '#1476d2' },
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: '5px 20px 5px 10px',
        borderRadius: '25px',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#202020',
        color: '#F7F7FF',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#1993F0' : isFocused ? '#2C2B2B' : undefined,
        color: '#F7F7FF',
        '&:active': { backgroundColor: '#1476d2' },
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        '&:hover': { color: '#1476d2' },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: '#1993F0',
    }),
    placeholder: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    input: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
}

const customCourseSelectStyles = {
    control: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: '#1993F0',
        color: '#F7F7FF',
        width: '400px',
        minHeight: '50px',
        '&:hover': { borderColor: '#1476d2' },
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: '0 auto',
        borderRadius: '25px',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#202020',
        color: '#F7F7FF',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#1993F0' : isFocused ? '#2C2B2B' : undefined,
        color: '#F7F7FF',
        '&:active': { backgroundColor: '#1476d2' },
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        '&:hover': { color: '#1476d2' },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: '#1993F0',
    }),
    placeholder: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    input: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
};

function ManageSubjects() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isModifyModalOpen, setModifyModalOpen] = useState(false);
    const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [subjectData, setSubjectData] = useState({
        subject_name: '',
        code: '',
        professorId: '',
        year: '',
        course_code: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setSubjectData({ ...subjectData, [name]: value });
    };

    const handleSubjectEdit = (subjectId) => {
        setSelectedSubjectForEdit(subjectId);
        setModifyModalOpen(true);
    };

    const handleCloseModifyModal = () => {
        setModifyModalOpen(false);
        setSelectedSubjectForEdit(null);
    };

    const handleSubjectUpdated = async () => {
        await fetchSubjects();
    };

    const handleSelectCourseChange = selectedOption => {
        setSubjectData({ ...subjectData, course_code: selectedOption ? selectedOption.value : '' });
    };

    const handleSelectYearChange = selectedOption => {
        setSubjectData({ ...subjectData, year: selectedOption ? selectedOption.value : '' });
    };

    const handleProfessorChange = (id) => {
        setSubjectData({ ...subjectData, professorId: id });
    };

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let i = currentYear; i >= 1950; i--) {
            options.push({ value: i.toString(), label: i.toString() });
        }
        return options;
    };

    const courseCodeOptions = [
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

    const animatedComponents = makeAnimated();

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);;

    const fetchSubjects = async () => {
        if (!searchTerm.trim()) {
            setSubjects([]);
            return;
        }
    
        const searchParameters = {
            searchString: searchTerm,
            year: selectedYear ? selectedYear.value : null,
            courseCode: selectedCourseId ? selectedCourseId.value : null,
        };
    
        try {
            const response = await fetch('http://localhost:8000/subjects/search', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParameters)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Došlo je do greške prilikom dohvatanja predmeta.');
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [searchTerm, selectedYear, selectedCourseId]);

    const handleModalSubmit = async (event) => {
        event.preventDefault();
    
        const requiredFields = ['subject_name', 'code', 'professorId', 'year', 'course_code'];
        const missingFields = requiredFields.filter(field => !subjectData[field]);
    
        if (missingFields.length > 0) {
            toast.error('Nedostaju sledeća polja: ' + missingFields.join(', '));
            return;
        }
    
        const formData = new FormData();
        formData.append('subject_name', subjectData.subject_name);
        formData.append('code', subjectData.code);
        formData.append('professorId', subjectData.professorId);
        formData.append('year', subjectData.year);
        formData.append('course_code', subjectData.course_code);
    
        try {
            const response = await fetch('http://localhost:8000/subjects/new', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
    
            if (response.status === 201) {
                setModalOpen(false);
                fetchSubjects();
                toast.success(`Uspešno kreiran predmet ${subjectData.subject_name} - ${subjectData.code}!`);
                return;
            } else if (response.status === 409) {
                toast.error("Predmet sa unetim kodom već postoji.");
                return;
            }
    
            toast.error("Došlo je do neočekivane greške prilikom kreiranja novog predmeta.");
        } catch (error) {
            console.error('Error adding subject:', error);
            toast.error('Došlo je do greške prilikom dodavanja predmeta.');
        }
    };    
    
    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <Sidebar />
            <div className='content'>
                <h1>Upravljanje predmetima</h1>
                <div className="search-bar">
                    <i className="fi fi-rr-search search-icon"></i>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Pretražite predmete..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select
                        components={animatedComponents}
                        options={getYearOptions()}
                        isClearable={true}
                        isSearchable={true}
                        placeholder="Godina"
                        onChange={setSelectedYear}
                        value={selectedYear}
                        styles={customYearSelectStyles}
                    />
                    <Select
                        components={animatedComponents}
                        options={courseCodeOptions}
                        isClearable={true}
                        isSearchable={true}
                        placeholder="Studijski program"
                        onChange={setSelectedCourseId}
                        value={selectedCourseId}
                        styles={customCourseSelectStyles}
                    />
                </div>

                <button className='new-subject-button' onClick={handleOpenModal}><div className='new-button-content'><i className="fi fi-rs-add"></i> DODAJ PREDMET</div></button>
                <NewSubjectModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleModalSubmit}
                    onInputChange={handleInputChange}
                    onSelectCourseChnage={handleSelectCourseChange}
                    onSelectYearChange={handleSelectYearChange}
                    onProfessorChange={handleProfessorChange}
                    subjectData={subjectData}/>

                <ModifySubjectModal
                    isOpen={isModifyModalOpen}
                    onClose={handleCloseModifyModal}
                    subject_id={selectedSubjectForEdit}
                    onSubjectUpdated={handleSubjectUpdated}
                />

                <div className='subject-list-wrap'>
                {subjects.map(subject => (
                    <SubjectContainer 
                        key={subject.id} 
                        subject={subject} 
                        onClick={() => handleSubjectEdit(subject.id)}
                    />
                ))}
                </div>
            </div>
        </div>
    );
}

export default ManageSubjects;
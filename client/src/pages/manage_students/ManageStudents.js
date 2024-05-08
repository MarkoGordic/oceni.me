import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar/Sidebar";
import './manage_students.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import NewStudentModal from "../../components/NewStudentModal/NewStudentModal";
import StudentCard from '../../components/StudentCard/StudentCard';
import { ToastContainer, toast } from 'react-toastify';
import ModifyStudentModal from '../../components/ModifyStudentModal/ModifyStudentModal';

const customSelectStyles = {
    control: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: '#1993F0',
        color: '#F7F7FF',
        width: 300,
        minHeight: '40px',
        '&:hover': { borderColor: '#1993F0' },
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        color: '#F7F7FF',
        width: 300,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.25)',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#1993F0' : isFocused ? '#2C2B2B' : undefined,
        color: isSelected ? '#F7F7FF' : '#F7F7FF',
        '&:active': { backgroundColor: '#1993F0' },
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        '&:hover': { color: '#F7F7FF' },
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

function ManageStudents() {
    const [searchString, setSearchString] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setModalOpen] = useState(false);
    const animatedComponents = makeAnimated();
    const [selectedCourseFilter, setSelectedCourseFilter] = useState(null);
    const [studentData, setStudentData] = useState({
        first_name: '',
        last_name: '',
        index_number: '',
        email: '',
        password: '',
        profile_image: null,
        course_code: '',
        gender: '',
    });

    const [modifyModalOpen, setModifyModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [deletionCount, setDeletionCount] = useState(0);

    const handleStudentClick = (studentId) => {
        setSelectedStudentId(studentId);
        setModifyModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            console.log(e.target.files[0]);
            setStudentData({ ...studentData, ['profile_image']: e.target.files[0] });
        } else {
            setStudentData({ ...studentData, [name]: value });
        }
    };

    const handleSelectChange = selectedOption => {
        setStudentData({ ...studentData, course_code: selectedOption ? selectedOption.value : '' });
    };

    const handleSearchChange = (event) => {
        setSearchString(event.target.value);
    };

    const handleGenderSelectChange = selectedOption => {
        setStudentData({ ...studentData, gender: selectedOption ? selectedOption.value : 'NP' });
    };

    const handleStudentUpdated = async () => {
        performSearch();
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
            const threshold = document.documentElement.offsetHeight * 0.9;
    
            if (scrollPosition >= threshold && hasMore && !loading) {
                setPage(prevPage => prevPage + 1);
            }
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading]);
    

    useEffect(() => {
        setSearchResults([]);
        setPage(1);
        setHasMore(true);

        if (searchString.trim() !== '' || selectedCourseFilter) {
            performSearch(1);
        }
    }, [searchString, selectedCourseFilter]);

    useEffect(() => {
        if (page >= 2) {
            performSearch(page);
        }
    }, [page]);

    const handleStudentDeleted = (studentId) => {
        setSearchResults(prevResults => prevResults.filter(student => student.id !== studentId));
    };
    
    const performSearch = async (page) => {
        if (loading) return;
        setLoading(true);
    
        try {
            const response = await fetch(`http://localhost:8000/students/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: searchString, course_code: selectedCourseFilter?.value, page: page }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length < 20) {
                    setHasMore(false);
                }
                if (data.length === 0) {
                    setSearchResults(prev => [...prev]);
                } else {
                    setSearchResults(prev => [...prev, ...data]);
                }
            } else {
                if(response.status == 400)
                    return;
                
                toast.error("Došlo je do neočekivane greške prilikom pretrage studenata.")
            }
        } catch (error) {
            console.error("Error searching students:", error);
            toast.error("Došlo je do neočekivane greške prilikom pretrage studenata.")
        } finally {
            setLoading(false);
        }
    };    

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const indexNumberPattern = /^[A-Z]{2}\s\d{1,3}\/\d{4}$/;
        const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    
        if (!indexNumberPattern.test(studentData.index_number)) {
            toast.error("Neuspešno kreiranje studenta. Proverite format broja indeksa. Primer: IN 22/2023.");
            return;
        }
        
        if (!studentData.course_code) {
            toast.error("Neuspešno kreiranje studenta. Molimo izaberite studijski program.");
            return;
        }

        if (!emailPattern.test(studentData.email)) {
            toast.error("Neuspešno kreiranje studenta. Neispravan format elektronske pošte.");
            return;
        }
    
        if (!passwordPattern.test(studentData.password)) {
            toast.error("Neuspešno kreiranje studenta. Lozinka mora sadržati najmanje 10 karaktera, od kojih bar jedno malo slovo, jedno veliko slovo, jedan broj i jedan specijalni karakter.");
            return;
        }

        const formData = new FormData();
        formData.append('first_name', studentData.first_name);
        formData.append('last_name', studentData.last_name);
        formData.append('index_number', studentData.index_number);
        formData.append('email', studentData.email);
        formData.append('password', studentData.password);
        formData.append('course_code', studentData.course_code);
        formData.append('gender', studentData.gender);
        
        if (studentData.profile_image) {
            formData.append('profile_image', studentData.profile_image);
        }

        try {
            const response = await fetch('http://localhost:8000/students/new', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (response.ok) {
                toast.success("Uspešno kreiran nalog za studenta " + studentData.first_name + " " + studentData.last_name + "!");
                setModalOpen(false);
            } else {
                toast.error("Došlo je do neočekivane greške prilikom kreiranja studentskog naloga.");
            }
        } catch (error) {
            toast.error("Došlo je do neočekivane greške prilikom kreiranja studentskog naloga.");
            console.error("Error submitting form:", error);
        }
    };

    const options = [
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

    return (
        <div className='wrap'>
            <Sidebar />
            <ToastContainer theme='dark'/>
            <div className='content'>
                <h1>Upravljanje studentima</h1>
                <div className="search-bar">
                    <i className="fi fi-rr-search search-icon"></i>
                    <input type="text" className="search-input" placeholder="Pretražite studente po imenu, prezimenu ili indeksu..." onChange={handleSearchChange} />
                    <Select
                        components={animatedComponents}
                        options={options}
                        styles={customSelectStyles}
                        classNamePrefix="select"
                        placeholder="Studijski program"
                        isClearable={true}
                        isSearchable={true}
                        onChange={setSelectedCourseFilter}
                        value={selectedCourseFilter}
                    />
                </div>

                <button className='new-student-button' onClick={handleOpenModal}><div className='new-button-content'><i className="fi fi-rs-add"></i> DODAJ STUDENTA</div></button>
                <NewStudentModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} onChange={handleInputChange} studentData={studentData} selectOnChange={handleSelectChange} onSelectGenderChange={handleGenderSelectChange}/>

                <div className='student-list-wrap'>
                    {(
                        searchResults.map((student) => (
                            <StudentCard
                                key={student.id}
                                name={`${student.first_name} ${student.last_name} - ${student.index_number}`}
                                email={student.email}
                                course={student.course_name}
                                profile_image={'http://localhost:8000/student_pfp/' + student.id + '.jpg'}
                                onClick={() => handleStudentClick(student.id)}
                            />
                        ))
                    )}
                </div>

                <ModifyStudentModal
                    isOpen={modifyModalOpen}
                    onClose={() => setModifyModalOpen(false)}
                    studentId={selectedStudentId}
                    onStudentDeleted={handleStudentDeleted}
                    onComplete={handleStudentUpdated}
                />
            </div>
        </div>
    );
}

export default ManageStudents;
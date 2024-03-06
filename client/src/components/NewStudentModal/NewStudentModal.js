import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './newStudentModal.css';

const customSelectStyles = {
  control: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: '#1C1B1B',
      borderColor: isFocused ? '#1993F0' : 'white',
      color: '#F7F7FF',
      width: '100%',
      minHeight: '40px',
      '&:hover': { borderColor: '#1993F0' },
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      marginBottom: '10px',
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

const NewStudentModal = ({ isOpen, onClose, onSubmit, onChange, studentData, selectOnChange }) => {
  if (!isOpen) return null;
  const animatedComponents = makeAnimated();

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
    <div className="new-student-modal-overlay" onClick={onClose}>
      <div className="new-student-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <h2>Dodaj novog studenta</h2>

          <label htmlFor="profile_image">Fotografija studenta:</label>
          <input type="file" id="profile_image" onChange={onChange} />

          <label htmlFor="first_name">Ime studenta:</label>
          <input type="text" id="first_name" placeholder="Petar" name="first_name" value={studentData.first_name} onChange={onChange} required />

          <label htmlFor="last_name">Prezime studenta:</label>
          <input type="text" id="last_name" placeholder="Petrović" name="last_name" value={studentData.last_name} onChange={onChange} required />

          <label htmlFor="index_number">Broj indeksa:</label>
          <input type="text" id="index_number" placeholder="XX YYY/ZZZZ" name="index_number" value={studentData.index_number} onChange={onChange} required />

          <label htmlFor="smer">Studijski program:</label>
          <Select
            components={animatedComponents}
            options={options}
            styles={customSelectStyles}
            classNamePrefix="new-student-select"
            placeholder="Studijski program"
            isClearable={true}
            isSearchable={true}
            onChange={selectOnChange}
          />

          <label htmlFor="email">Elektronska pošta:</label>
          <input type="email" id="email" placeholder="primer.tidajem@uns.ac.rs" name="email" value={studentData.email} onChange={onChange} required />

          <label htmlFor="password">Početna lozinka:</label>
          <input type="password" id="password" placeholder="MnogoJakaSifra" name="password" value={studentData.password} onChange={onChange} required />

          <button type="submit">DODAJ STUDENTA</button>
        </form>
        <button className='new-student-modal-close-button' onClick={onClose}>ODUSTANI</button>
      </div>
    </div>
  );

};

export default NewStudentModal;

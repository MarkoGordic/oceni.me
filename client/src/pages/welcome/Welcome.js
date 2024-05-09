import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import makeAnimated from 'react-select/animated';
import Select from 'react-select';
import './welcome.css';

const customSelectStyles = {
    control: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: isFocused ? '#1993F0' : 'white',
        color: '#F7F7FF',
        width: '350px',
        minHeight: '40px',
        '&:hover': { borderColor: '#1993F0' },
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        marginBottom: '10px',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        color: '#F7F7FF',
        width: 350,
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

function Welcome() {
    const fullText = [
        "Ja sam neko sasvim običan, manje bitan...",
        "Samo jedna mala duša na ovome svetu...",
        "Ali opet, ja sam neko, ko je ceo svoj svet",
        "video u tebi...",
        "💙"
    ];

    const animatedComponents = makeAnimated();
    const [linesToShow, setLinesToShow] = useState([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('welcome_quote');
    const [isLoading, setIsLoading] = useState(true);

    const [selectedGender, setSelectedGender] = useState(null);
    const handleGenderSelectChange = (selectedOption) => {
        setSelectedGender(selectedOption.value);
    };

    const genderOptions = [
        { value: 'M', label: 'MUŠKO' },
        { value: 'F', label: 'ŽENSKO' },
      ];

    useEffect(() => {
        const newTabs = [
            {
                id: 'welcome_quote',
                title: 'Welcome',
                content: (
                    <div className="welcome-wrap fade-in">
                        <div className="welcome-content">
                            {linesToShow.map((line, index) => (
                                <div key={index} className="welcome-quote" style={{ animation: 'slideIn 0.5s ease forwards' }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            },
            {
                id: 'welcome_init1',
                title: 'Welcome init',
                content: (
                    <div className="other-tab fade-in">
                        <div className="welcome-app">OCENI.ME</div>
                        <p className='welcome-app-info'>Pokreće se poces konfiguracije ove instance.</p>
                        <p className='welcome-app-warning'>Nemojte napuštati platformu dok se konfiguracija ne završi!</p>
                        <div className="welcome-loader"></div>
                    </div>
                )
            },
            {
                id: 'welcome_setup',
                title: 'Welcome setup',
                content: (
                    <div className="other-tab fade-in">
                        <div className="welcome-app">OCENI.ME</div>
                        <h4>KONFIGURACIJA (1/4)</h4>
                        <p className='welcome-app-info'>Potrebno je da postavite inicijalne parametre za ovu OCENI.ME instancu.</p>

                        <h2>Kako ovo da uradim?</h2>
                        <p className='welcome-app-info'>Porebno je da otvorite vaš docker koji pokreće backend server.</p>
                        <p className='welcome-app-info' style={{marginBottom: "20px"}}>Kada pristupite docker-u, potrebno je postaviti sledece .ENV parametre:</p>
                        <p className='welcome-app-info'><span style={{color: "white"}}>MAX_DOCKER_CONTAINERS</span> - Maksimalan broj konkurentnih doker instanci prilikom testiranja</p>
                        <p className='welcome-app-info'><span style={{color: "white"}}>SESSION_SECRET</span> - Tajna koju će server koristiti za enkripciju korisničkih sesija</p>
                        <p className='welcome-app-info'><span style={{color: "white"}}>DB_USER</span> - Vaše korisničko ime u MySQL bazi</p>
                        <p className='welcome-app-info'><span style={{color: "white"}}>DB_PASSWORD</span> - Lozinka za korisnički nalog u MySQL bazi</p>
                        <p className='welcome-app-info'><span style={{color: "white"}}>DB_HOST</span> - URL na kom se hostuje MySQL baza</p>
                        <p className='welcome-app-info' style={{marginBottom: "20px"}}><span style={{color: "white"}}>DB_DATABASE</span> - Ime baze koja će biti korišćena za potrebe ove OCENI.ME instance</p>
                        <p className='welcome-app-info'>Kada podesite .ENV fajl, restartujte backend instancu i kliknite NASTAVI!</p>

                        <button className='welcome-app-button' onClick={handleInitApp}>NASTAVI</button>
                    </div>
                )
            },
            {
                id: 'connection_success',
                title: 'Connection success',
                content: (
                    <div className="other-tab fade-in">
                        <div className="welcome-app">OCENI.ME</div>
                        <h4>KONFIGURACIJA (2/4)</h4>
                        <p className='welcome-app-info'>Uspostavljena je konekcija sa serverom.</p>
                        <p className='welcome-app-info' style={{marginBottom: "70px"}}>Preusmeravanje u toku...</p>
                        <div className="welcome-loader"></div>
                    </div>
                )
            },
            {
                id: 'welcome_account',
                title: 'Welcome account',
                content: (
                    <div className="other-tab fade-in">
                        <div className="welcome-app">OCENI.ME</div>
                        <h4>KONFIGURACIJA (3/4)</h4>
                        <p className='welcome-app-info'>Potrebno je da kreirate administratorski nalog popunjavanjem polja ispod.</p>
                        
                        <div className="welcome-account-form">
                            <form>
                                <div className='welcome-account-form-row'>
                                    <div>
                                        <label htmlFor="username">Ime:</label>
                                        <input type="text" id="first_name" name="first_name" placeholder='Nađa'required />
                                    </div>

                                    <div>
                                        <label htmlFor="username">Prezime:</label>
                                        <input type="text" id="last_name" name="last_name" placeholder='Jakšić'required />
                                    </div>
                                </div>
                                
                                <div className='welcome-account-form-row'>
                                    <div>
                                        <label htmlFor="email">Email:</label>
                                        <input type="email" id="email" name="email" placeholder='jaksic.in33.2023@uns.ac.rs' required />
                                    </div>

                                    <div>
                                        <label htmlFor='confirmEmail'>Potvrdi email:</label>
                                        <input type='email' id='confirmEmail' name='confirmEmail' placeholder='jaksic.in33.2023@uns.ac.rs' required />
                                    </div>
                                </div>
                                
                                <div className='welcome-account-form-row'>
                                    <div>
                                        <label htmlFor="password">Lozinka:</label>
                                        <input type="password" id="password" name="password" placeholder='MnogoJakaSifra123!' required />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword">Potvrdi lozinku:</label>
                                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder='MnogoJakaSifra123!' required />
                                    </div>
                                </div>
                                
                                <div className='welcome-account-gender-select'>
                                    <Select
                                        id="gender"
                                        components={animatedComponents}
                                        options={genderOptions}
                                        styles={customSelectStyles}
                                        placeholder="Pol"
                                        isClearable={false}
                                        className="gender-select"
                                        onChange={handleGenderSelectChange}
                                        required
                                    />
                                </div>

                                <button onClick={handleCreateAccount}>KRAIRAJ NALOG I NASTAVI</button>
                            </form>
                        </div>
                    </div>
                )
            },
            {
                id: 'final_setup',
                title: 'Final setup',
                content: (
                    <div className="other-tab fade-in">
                        <div className="welcome-app">OCENI.ME</div>
                        <h4>KONFIGURACIJA (4/4)</h4>
                        <p className='welcome-app-info'>Vaš administratorski nalog je uspešno kreiran.</p>
                        <p className='welcome-app-info' style={{marginBottom: "70px"}}>Preusmeravanje u toku...</p>
                        <div className="welcome-loader"></div>
                    </div>
                )
            }
        ];
        setTabs(newTabs);
    }, [isLoading, linesToShow, selectedGender]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (currentLine < fullText.length) {
                setLinesToShow(lines => [...lines, fullText[currentLine]]);
                setCurrentLine(current => current + 1);
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    setActiveTab('welcome_setup');
                }, 5000);
            }
        }, 3000);

        return () => clearInterval(timer);
    }, [currentLine, fullText.length]);

    const handleInitApp = async () => {
        try {
            const response = await fetch('http://localhost:8000/init/init', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.status === 200) {
                toast.success('Konekcija sa serverom uspešno uspostavljena.')
                setActiveTab('connection_success');
                setTimeout(() => {
                    setActiveTab('welcome_account');
                }, 5000);
            } else {
                toast.error("Zahtev za konekciju sa serverom je odbijen. Ova instanca je već podešena.")
            }
        } catch (error) {
            toast.error('Došlo je do greške prilikom povezivanja sa serverom. Proverite konfiguraciju.');
        }
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();
    
        const formData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            confirmEmail: document.getElementById('confirmEmail').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            gender: selectedGender,
            role: 1
        };

        if(formData.password !== formData.confirmPassword || formData.email !== formData.confirmEmail) {
            toast.error('Lozinke ili email adrese se ne poklapaju.');
            return;
        }

        if(!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.gender){
            toast.error('Niste popunili sva polja.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8000/init/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                toast.success('Registracija uspešna. Administratorski nalog je kreiran.');
                setActiveTab('final_setup');
                setTimeout(() => {
                    window.location.href = 'http://localhost:3000/';
                }, 5000);
            } else {
                toast.error('Registracija je odbijena. Ova instanca je već podešena.');
            }
        } catch (error) {
            toast.error('Registracija je odbijena. Ova instanca je već podešena.');
        }
    };
    

    return (
        <div>
            {tabs.map(tab => (
                <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
                    {tab.content}
                </div>
            ))}
        </div>
    );
}

export default Welcome;

import React, { useState, useEffect } from 'react';
import './welcome.css';

function Welcome() {
    const fullText = [
        "Ja sam neko sasvim običan, manje bitan...",
        "Samo jedna mala duša na ovome svetu...",
        "Ali opet, ja sam neko, ko je ceo svoj svet",
        "video u tebi...",
        "💙"
    ];

    const [linesToShow, setLinesToShow] = useState([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('welcome_quote');
    const [isLoading, setIsLoading] = useState(true);

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
                        <p className='welcome-app-info'>U procesu je inicijalna konfiguracija aplikacije. Budite strpljivi.</p>
                        <div className="welcome-loader"></div>
                    </div>
                )
            },
            {
                id: 'welcome_init',
                title: 'Welcome account',
                content: (
                    <div className="other-tab fade-in">
                        <div className="welcome-app">OCENI.ME</div>
                        <h4>KONFIGURACIJA (1/4)</h4>
                        <p className='welcome-app-info'>Potrebno je da kreirate administratorski nalog popunjavanjem polja ispod.</p>
                        
                        <div className="welcome-account-form">
                            <form>
                                <label htmlFor="username">Ime:</label>
                                <input type="text" id="first_name" name="first_name" placeholder='Nađa'required />

                                <label htmlFor="username">Prezime:</label>
                                <input type="text" id="first_name" name="first_name" placeholder='Jakšić'required />
                                
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" placeholder='jaksic.in33.2023@uns.ac.rs' required />

                                <label htmlFor="password">Lozinka:</label>
                                <input type="password" id="password" name="password" placeholder='MnogoJakaSifra123!' required />

                                <label htmlFor="confirmPassword">Potvrdi lozinku:</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" placeholder='MnogoJakaSifra123!' required />
                                
                                <button type="submit">KRAIRAJ NALOG I NASTAVI</button>
                            </form>
                        </div>
                    </div>
                )
            }
        ];
        setTabs(newTabs);
    }, [isLoading, linesToShow]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (currentLine < fullText.length) {
                setLinesToShow(lines => [...lines, fullText[currentLine]]);
                setCurrentLine(current => current + 1);
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    setActiveTab('welcome_init');
                }, 5000);
            }
        }, 3000);

        return () => clearInterval(timer);
    }, [currentLine, fullText.length]);

    const handleCreateAccount = (event) => {
        event.preventDefault();
        // Extract values from the event target and manage state or call API
        console.log("Creating account...");
        // Implement the actual account creation logic here
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

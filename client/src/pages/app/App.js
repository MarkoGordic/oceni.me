import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './app.css';

function App() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        avatar: '',
        id: null,
        gender: ''
    });

    const [activities, setActivities] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:8000/employees/me', {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const userData = await response.json();
                setUser({
                    name: `${userData.first_name} ${userData.last_name}`,
                    email: userData.email,
                    avatar: userData.avatar,
                    id: userData.id,
                    gender: userData.gender
                });

                fetchActivities(userData.id);
            } catch (error) {
                console.error('There was a problem fetching user data:', error);
            }
        };

        fetchUserData();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchActivities = async (userId) => {
        try {
            const response = await fetch('http://localhost:8000/logs/fetch_logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: userId,
                    offset: 0,
                    limit: 5
                }),
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();

            const activities = data.logs.map(log => ({
                time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
                message: log.message
            }));
    
            setActivities(activities);
        } catch (error) {
            console.error('There was a problem fetching activities:', error);
        }
    };

    const getGreeting = () => {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const dateToday = now.getDate();
        const monthToday = now.getMonth();
    
        const firstName = user.name.split(' ')[0];
        const genderPrefix = user.gender === 'M' ? 'budan' : 'budna';
    
        const isNewYear = (dateToday === 1 && monthToday === 0);
        const isChristmas = (dateToday === 7 && monthToday === 0);
        const isValentines = (dateToday === 14 && monthToday === 1);
        const isInternationalWorkersDay = (dateToday === 1 && monthToday === 4);
    
        if (isNewYear) {
            return <p>🎉 Srećna Nova Godina, {firstName}! 🍾</p>;
        } else if (isChristmas) {
            return <p>🎄 Srećan Božić, {firstName}! Mir Božji, Hristos se rodi!</p>;
        } else if (isValentines) {
            return <p>❤️ Srećan Dan zaljubljenih, {firstName}!</p>;
        } else if (isInternationalWorkersDay) {
            return <p>🔨 Srećan Praznik rada, {firstName}!</p>;
        }
    
        const dayGreetings = {
            0: `🍂 Uživaj u nedeljnom odmoru, zaslužila si!`,
            1: `🌞 Nova nedelja, nove prilike za uspeh te čekaju!`,
            2: `💪 Uzmi dan u ruke i napravi nešto sjajno!`,
            3: `🐫 Sredina nedelje je tu, drži se, skoro je vikend!`,
            4: `🌟 Još samo malo do vikenda, izdrži!`,
            5: `🎉 Petak je! Skoro vikend za opuštanje i zabavu!`,
            6: `🎈 Uživaj u suboti, vreme je za avanture!`
        };
    
        let timeGreeting;
        if (hour < 5) {
            timeGreeting = `🌒 ${firstName}, kako to da si još ${genderPrefix}?`;
        } else if (hour < 12) {
            timeGreeting = `☀️ Dobro jutro, ${firstName}!`;
        } else if (hour < 17) {
            timeGreeting = `🌞 Dobar dan, ${firstName}!`;
        } else {
            timeGreeting = `🌜 Dobro veče, ${firstName}!`;
        }
    
        if (dayOfWeek === 0 && user.gender === 'F') {
            dayGreetings[0] = "🍂 Uživaj u nedeljnom odmoru, zaslužila si!";
        } else if (dayOfWeek === 0 && user.gender === 'M') {
            dayGreetings[0] = "🍂 Uživaj u nedeljnom odmoru, zaslužio si!";
        }
    
        return (
            <>
                <p style={{"margin" : "0px"}}>{timeGreeting}</p>
                <p style={{"margin" : "0px", "fontSize": "20px", "color" : "#BABABA"}}>{dayGreetings[dayOfWeek]}</p>
            </>
        );
    };    

    return (
        <div className='wrap'>
        <Sidebar />
        <div className='content'>
            <div className='content-wrap'>
                <div className="greeting-container">
                    <h1 className="greeting-message">{getGreeting()}</h1>
                    <hr className="delimiter"/>
                    <div className="date-time-container">
                        <h2 className="current-date">{currentTime.toLocaleDateString('sr-Latn-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</h2>
                        <h3 className="current-time">{currentTime.toLocaleTimeString('sr-Latn-RS', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</h3>
                    </div>
                </div>
                    <div className="timeline-container"> 
                        <div className="timeline">
                            {activities.map((activity, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <p className='timeline-content-msg'>{activity.message}</p>
                                        <p className='timeline-content-time'>{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;

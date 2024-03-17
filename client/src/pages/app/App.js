import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './app.css';

function App() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        avatar: '',
        id: null
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
                    id: userData.id
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
        const hour = new Date().getHours();
        if (hour < 12) return `☀️ Dobro jutro, ${user.name}!`;
        if (hour < 18) return `🌞 Dobar dan, ${user.name}!`;
        return `🌜 Dobro veče, ${user.name}!`;
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

import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatar: '',
        id: '',
        role: null,
    });

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
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    name: `${userData.first_name} ${userData.last_name}`,
                    email: userData.email,
                    avatar: `http://localhost:8000/user_pfp/${userData.id}.jpg`,
                    id: userData.id,
                    role: userData.role,
                });
            } catch (error) {
                console.error('There was a problem fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
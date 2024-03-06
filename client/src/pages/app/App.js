import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './app.css';

function App() {
  const [user, setUser] = useState({
      name: '',
      email: '',
      avatar: ''
  });

  useEffect(() => {
      const fetchUserData = async () => {
          try {
              const response = await fetch('http://localhost:8000/user/me', {
                  credentials: 'include',
              });
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const userData = await response.json();
              setUser({
                  name: userData.first_name + ' ' + userData.last_name,
                  email: userData.email,
                  avatar: userData.avatar,
                  id: userData.id
              });
          } catch (error) {
              console.error('There was a problem fetching user data:', error);
          }
      };

      fetchUserData();
  }, []);


  return (
    <div className='wrap'>
        <Sidebar />
        <div className='content'>
          <h1></h1>
        </div>
    </div>
  );
}

export default App;

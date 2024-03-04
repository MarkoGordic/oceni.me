import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './app.css';

function App() {

  return (
    <div className='wrap'>
        <Sidebar />
        <div className='content'></div>
    </div>
  );
}

export default App;

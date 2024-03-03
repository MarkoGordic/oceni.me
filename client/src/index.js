import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './pages/login/Login';
import './pages/login/login.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);
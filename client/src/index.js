import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import App from './pages/app/App';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import ManageStudents from './pages/manage_students/ManageStudents';
import ManageEmployees from './pages/manage_employess/ManageEmployees';
import ManageSubjects from './pages/manage_subjects/ManageSubjects';
import SystemLogs from './pages/system_logs/SystemLogs';
import MySubjects from './pages/my_subjects/MySubjects';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer theme="dark" />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />
          <Route path="subjects" element={
            <ProtectedRoute>
              <MySubjects />
            </ProtectedRoute>
          } />
          <Route path="/manage_students" element={
            <ProtectedRoute>
              <ManageStudents />
            </ProtectedRoute> 
          } />
          <Route path="/admin/subjects" element={
            <ProtectedRoute>
              <ManageSubjects />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <ManageEmployees />
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute>
              <SystemLogs />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
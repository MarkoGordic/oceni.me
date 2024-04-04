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
import UserProfile from './pages/user_profile/UserProfile';
import SubjectOverview from './pages/subject_overview/SubjectOverview';
import NewTestWizard from './pages/NewTestWizard/NewTestWizard';
import SubjectStudents from './pages/subject_students/SubjectStudents';
import ManageTestConfigurations from './pages/manage_test_configurations/ManageTestConfigurations';
import ManageSubject from './pages/manage_subject/ManageSubject';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ConfigureTest from './pages/configure_test/ConfigureTest';
import { UserProvider } from './contexts/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/app" element={<ProtectedRoute><UserProvider><App /></UserProvider></ProtectedRoute>} />

          <Route path="/subjects" element={<ProtectedRoute><UserProvider><MySubjects /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/overview" element={<ProtectedRoute><UserProvider><SubjectOverview /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/tests/new" element={<ProtectedRoute><UserProvider><NewTestWizard /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/tests/new/:testid" element={<ProtectedRoute><UserProvider><NewTestWizard /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/tests/configurations" element={<ProtectedRoute><UserProvider><ManageTestConfigurations /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/tests/configure" element={<ProtectedRoute><UserProvider><ConfigureTest /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/tests/configure/:configid" element={<ProtectedRoute><UserProvider><ConfigureTest /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/students" element={<ProtectedRoute><UserProvider><SubjectStudents /></UserProvider></ProtectedRoute>} />
          <Route path="/subjects/:id/manage" element={<ProtectedRoute><UserProvider><ManageSubject /></UserProvider></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><UserProvider><UserProfile /></UserProvider></ProtectedRoute>} />
          <Route path="/manage_students" element={<ProtectedRoute><UserProvider><ManageStudents /></UserProvider></ProtectedRoute>} />
          
          <Route path="/admin/subjects" element={<ProtectedRoute><UserProvider><ManageSubjects /></UserProvider></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UserProvider><ManageEmployees /></UserProvider></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute><UserProvider><SystemLogs /></UserProvider></ProtectedRoute>} />
        </Routes>
        <ToastContainer theme="dark" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
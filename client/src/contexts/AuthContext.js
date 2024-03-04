import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/status', {credentials: 'include',});
        const data = await response.json();
        console.log("Auth status from API:", data.isAuthenticated);
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error("Failed to fetch auth status", error);
      }
    };

    checkAuthStatus();
  }, [setIsAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

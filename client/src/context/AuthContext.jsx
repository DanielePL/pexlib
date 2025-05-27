import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Beim Laden der App überprüfen, ob ein Token existiert
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        // Hier könnten Sie auch den Benutzer aus dem Token dekodieren oder vom Server laden
        setUser({ id: 'admin', role: 'admin' }); // Vereinfacht für Demo
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
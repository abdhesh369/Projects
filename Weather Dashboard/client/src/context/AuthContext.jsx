// client/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const contextValue = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUnitPreference: async (newUnits) => {
      if (isAuthenticated) {
        try {
          // Future: Implement PATCH /api/user/preferences
          // For now, we'll just keep it in localStorage as placeholder 
          // but the schema is ready.
        } catch (err) {
          console.error('Failed to sync preferences');
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
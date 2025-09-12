// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authStatus = localStorage.getItem('bq_admin_authenticated');
    const authTime = localStorage.getItem('bq_admin_auth_time');
    
    // Optional: Auto-logout after 24 hours
    if (authStatus === 'true' && authTime) {
      const timeElapsed = Date.now() - parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeElapsed > twentyFourHours) {
        logout();
        setIsLoading(false);
        return;
      }
    }
    
    setIsAuthenticated(authStatus === 'true');
    setIsLoading(false);
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
  localStorage.removeItem('bq_admin_authenticated');
  localStorage.removeItem('bq_admin_auth_time');
  setIsAuthenticated(false); // This line is crucial
};

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};
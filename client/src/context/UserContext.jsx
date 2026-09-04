// Here contains the logic for the user context, which manages the state of the user's authentication and session, including login, logout, and persisting user information in localStorage.

import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load saved user session on initial render
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save or clear user session in localStorage
  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <UserContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook for accessing user auth state
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { tripAPI } from '../api/tripAPI';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isTaskbarSlid, setTaskbarSlid] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await tripAPI.auth.getMe();
        setUser(u);
      } catch (err) {
        console.error("Context Identity Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const isMaster = user?.is_master || user?.email?.toLowerCase() === 'middlemen1245@gmail.com';

  const logout = async () => {
    await tripAPI.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <UIContext.Provider value={{ isTaskbarSlid, setTaskbarSlid, user, isMaster, logout, loading }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

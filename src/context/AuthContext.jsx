import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('oms_token');
    const email = localStorage.getItem('oms_email');
    if (token && email) {
      setAuth({ email, token, role: 'admin' });
    }
    setLoading(false);
  }, []);

  const login = (email, token) => {
    const authData = { email, token, role: 'admin' };
    setAuth(authData);
    localStorage.setItem('oms_token', token);
    localStorage.setItem('oms_email', email);
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('oms_token');
    localStorage.removeItem('oms_email');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

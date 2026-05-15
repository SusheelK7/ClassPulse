import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  const updateProfile = async (form) => {
    const { data } = await api.put('/auth/profile', form);
    setUser(data);
    return data;
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

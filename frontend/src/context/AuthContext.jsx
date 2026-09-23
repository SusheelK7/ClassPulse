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
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (form) => {
    const { data } = await api.put('/auth/profile', form);
    setUser(data);
    return data;
  };

  const verifyEmail = async (email, code) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    return data;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (email, code, password, confirmPassword) => {
    const { data } = await api.post('/auth/reset-password', { email, code, password, confirmPassword });
    return data;
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword });
    localStorage.removeItem('token');
    setUser(null);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateProfile,
      verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
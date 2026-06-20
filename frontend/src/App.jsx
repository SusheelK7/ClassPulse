import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ClassProvider } from './context/ClassContext';
import { NoteProvider } from './context/NoteContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationQueueProvider } from './context/NotificationQueueContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Notes from './pages/Notes';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClassProvider>
          <NoteProvider>
            <NotificationProvider>
              <NotificationQueueProvider>
                <BrowserRouter>
                  <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
                  <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                <Route path="/schedule" element={<PrivateRoute><Layout><Schedule /></Layout></PrivateRoute>} />
                <Route path="/notes" element={<PrivateRoute><Layout><Notes /></Layout></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </BrowserRouter>
              </NotificationQueueProvider>
            </NotificationProvider>
          </NoteProvider>
        </ClassProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

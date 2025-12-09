import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { TimetablePage } from '../pages/TimetablePage';
import { AdminPage } from '../pages/AdminPage';
import { InstallPrompt } from '../components/InstallPrompt';
import '../styles.css';

// Get base path from import.meta.env (set by Vite)
// Remove trailing slash if present for React Router basename
const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'a'
      ) {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <>
      <BrowserRouter basename={basePath}>
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
      <InstallPrompt />
    </>
  );
}

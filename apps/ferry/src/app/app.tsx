import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { TimetablePage } from '../pages/TimetablePage';
import { InstallPrompt } from '../components/InstallPrompt';
import '../styles.css';

// Get base path from import.meta.env (set by Vite)
// Remove trailing slash if present for React Router basename
const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

export default function App() {
  return (
    <>
      <BrowserRouter basename={basePath}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
        </Routes>
      </BrowserRouter>
      <InstallPrompt />
    </>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { TimetablePage } from '../pages/TimetablePage';
import { InstallPrompt } from '../components/InstallPrompt';
import '../styles.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
        </Routes>
      </BrowserRouter>
      <InstallPrompt />
    </>
  );
}

export default App;

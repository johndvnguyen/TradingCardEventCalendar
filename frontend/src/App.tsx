import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CalendarPage } from './pages/CalendarPage';
import { EventPage } from './pages/EventPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/event/:token" element={<EventPage />} />
        <Route path="/register/:token" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

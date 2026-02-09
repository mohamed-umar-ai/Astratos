import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AnomaliesPage from './pages/AnomaliesPage';
import ForecastsPage from './pages/ForecastsPage';
import AuditPage from './pages/AuditPage';
import './styles/tailwind.css';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/forecasts" element={<ForecastsPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;

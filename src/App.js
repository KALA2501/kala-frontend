import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop'; // <<--- Importamos ScrollToTop
import Login from './features/auth/pages/LoginPage';
import Home from './features/home/pages/HomePage';
import CentroMedicoPanelPage from './features/panel/pages/CentroMedicoPanelPage';
import AdminPanel from './features/admin/pages/AdminPanelPage';
import DoctorPanelPage from './features/medicos/pages/DoctorPanelPage';
import RegisterPatientPage from './features/pacientes/pages/RegisterPatientPage';
import PacientePanelPage from './features/pacientes/pages/PacientePanelPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/panel" element={<CentroMedicoPanelPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/main-panel" element={<CentroMedicoPanelPage />} />
        <Route path="/medico-panel" element={<DoctorPanelPage />} />
        <Route path="/register-patient" element={<RegisterPatientPage />} />
        <Route path="/paciente-panel" element={<PacientePanelPage />} />
      </Routes>
    </Router>
  );
}

export default App;

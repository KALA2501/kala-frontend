import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './features/auth/pages/LoginPage';
import MainPanel from './features/panel/pages/CentroMedicoPanelPage';
import Home from './features/home/pages/HomePage';
import AdminPanel from './features/admin/pages/AdminPanelPage';
import DoctorPanelPage from './features/medicos/pages/DoctorPanelPage';
import RegisterPatientPage from './features/pacientes/pages/RegisterPatientPage';
import PacientePanelPage from './features/pacientes/pages/PacientePanelPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/main-panel" element={<MainPanel />} />
        <Route path="/medico-panel" element={<DoctorPanelPage />} />
        <Route path="/register-patient" element={<RegisterPatientPage />} />
        <Route path="/paciente-panel" element={<PacientePanelPage />} />

      </Routes>
    </Router>
  );
}

export default App;

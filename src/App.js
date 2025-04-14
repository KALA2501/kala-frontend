import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MainPanel from './pages/MainPanel';
import Panel from './pages/Panel';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import DoctorPanelPage from './features/medicos/pages/DoctorPanelPage';
import RegisterPatientPage from './features/pacientes/pages/RegisterPatientPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/main-panel" element={<MainPanel />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/medico-panel" element={<DoctorPanelPage />} />
        <Route path="/register-patient" element={<RegisterPatientPage />} />
      </Routes>
    </Router>
  );
}

export default App;

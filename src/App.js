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
import PacientesActividades from './features/pacientes/pages/PacientesActividades';
import LawtonFormPage from './features/medicos/pages/LawtonForm';
import LawtonViewPage from './features/medicos/pages/LawtonViewPage';
import LawtonReportPage from './features/medicos/pages/LawtonReportPage';
import FormulariosPage from './features/medicos/pages/FormulariosPage';
import DadFormPage from './features/medicos/pages/DadFormPage';
import FaqFormPage from './features/medicos/pages/FaqFormPage';
import FaqViewPage from './features/medicos/pages/FaqViewPage';
import DadViewPage from './features/medicos/pages/DadViewPage';
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
        <Route path="/paciente/juegos" element={<PacientesActividades />} />
        <Route path="/lawton-form" element={<LawtonFormPage />} />
        <Route path="/lawton-view/:pacienteId" element={<LawtonViewPage />} />
        <Route path="/lawton-reportes" element={<LawtonReportPage />} />
        <Route path="/formularios" element={<FormulariosPage />} />
        <Route path="/dad-form" element={<DadFormPage />} />
        <Route path="/faq-form" element={<FaqFormPage />} /> 
        <Route path="/faq-view/:pacienteId" element={<FaqViewPage />} /> 
        <Route path="/dad-view/:pacienteId" element={<DadViewPage />} />
      </Routes>
    </Router>
  );
}

export default App;

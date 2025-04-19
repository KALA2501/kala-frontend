import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import CentroMedicoPanelPage from './features/panel/pages/CentroMedicoPanelPage';
import AdminPanelPage from './features/admin/pages/AdminPanelPage';
import DoctorPanelPage from './features/medicos/pages/DoctorPanelPage';
import RegisterPatientPage from './features/pacientes/pages/RegisterPatientPage';
import PacientePanelPage from './features/pacientes/pages/PacientePanelPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/panel" element={<CentroMedicoPanelPage />} />
        <Route path="/admin-panel" element={<AdminPanelPage />} />
        <Route path="/medico-panel" element={<DoctorPanelPage />} />
        <Route path="/medico/agregar-paciente" element={<RegisterPatientPage />} />
        <Route path="/paciente-panel" element={<PacientePanelPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

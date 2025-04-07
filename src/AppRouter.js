import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Panel from './pages/Panel';
import AdminPanel from './pages/AdminPanel';
import MedicoPanel from './pages/MedicoPanel'; 
import AgregarPaciente from './pages/AgregarPaciente'; 

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/medico-panel" element={<MedicoPanel />} /> {}
        <Route path="/medico/agregar-paciente" element={<AgregarPaciente />} /> {}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

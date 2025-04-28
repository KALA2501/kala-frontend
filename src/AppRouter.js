import { useEffect, useState } from 'react';
import axios from 'axios';

function AppRouter() {
  const [userRole, setUserRole] = useState(null);
  const [usersByRole, setUsersByRole] = useState({});

  useEffect(() => {
    async function fetchUsersByRole() {
      try {
        const response = await axios.get('/api/admin/usuarios-firebase');
        console.log('🔍 Datos recibidos del backend:', response.data);
        setUsersByRole(response.data.usuariosPorRol);
      } catch (error) {
        console.error('❌ Error al obtener usuarios por rol:', error);
      }
    }
    fetchUsersByRole();
  }, []);

  if (!usersByRole) {
    return <div>Loading...</div>;
  }

  console.log('🔍 Procesando usuarios por rol:', usersByRole);
  Object.keys(usersByRole).forEach(role => {
    console.log(`Usuarios con rol ${role}:`, usersByRole[role]);
  });
  console.log('🔍 Usuarios con rol medico:', usersByRole['medico']);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {Object.keys(usersByRole).map((role) => {
          if (role === 'centro_medico') {
            return <Route key={role} path="/panel" element={<CentroMedicoPanelPage />} />;
          }
          if (role === 'medico') {
            return <Route key={role} path="/medico-panel" element={<DoctorPanelPage />} />;
          }
          if (role === 'paciente') {
            return <Route key={role} path="/paciente-panel" element={<PacientePanelPage />} />;
          }
          return null;
        })}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

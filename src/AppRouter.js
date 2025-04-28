import { useEffect, useState } from 'react';
import axios from 'axios';

function AppRouter() {
  const [userRol, setUserRol] = useState(null);
  const [usersByRol, setUsersByRol] = useState({});

  useEffect(() => {
    async function fetchUsersByRol() {
      try {
        const response = await axios.get('/api/admin/usuarios-firebase');
        console.log('🔍 Datos recibidos del backend:', response.data);
        setUsersByRol(response.data.usuariosPorRol);
      } catch (error) {
        console.error('❌ Error al obtener usuarios por rol:', error);
      }
    }
    fetchUsersByRol();
  }, []);

  if (!usersByRol) {
    return <div>Loading...</div>;
  }

  console.log('🔍 Procesando usuarios por rol:', usersByRol);
  Object.keys(usersByRol).forEach(rol => {
    console.log(`Usuarios con rol ${rol}:`, usersByRol[rol]);
  });
  console.log('🔍 Usuarios con rol medico:', usersByRol['medico']);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {Object.keys(usersByRol).map((rol) => {
          if (rol === 'centro_medico') {
            return <Route key={rol} path="/panel" element={<CentroMedicoPanelPage />} />;
          }
          if (rol === 'medico') {
            return <Route key={rol} path="/medico-panel" element={<DoctorPanelPage />} />;
          }
          if (rol === 'paciente') {
            return <Route key={rol} path="/paciente-panel" element={<PacientePanelPage />} />;
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

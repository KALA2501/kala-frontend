import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoKala from '../../../../assets/LogoKala.png';
import {
  FaHome,
  FaChartLine,
  FaUserInjured,
  FaFileSignature,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const opcionesMenu = [
  { etiqueta: 'Inicio', ruta: '/medico-panel', icono: <FaHome /> },
  { etiqueta: 'Reportes', ruta: '/lawton-reportes', icono: <FaChartLine /> },
  { etiqueta: 'Métricas', ruta: '/metrics', icono: <FaChartLine /> },
  { etiqueta: 'Pacientes', ruta: '/medico-pacientes', icono: <FaUserInjured /> },
  { etiqueta: 'Formularios', ruta: '/formularios', icono: <FaFileSignature /> },
  { etiqueta: 'Notificaciones', ruta: '/notificaciones', icono: <FaBell /> },
  { etiqueta: 'Configuraciones', ruta: '/configuracion', icono: <FaCog /> },
];

const MenuLateralMedico = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [colapsado, setColapsado] = useState(false);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(
            `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setDoctor(res.data);
        } catch (err) {
          console.error('❌ Error al obtener médico:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate('/');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <aside
      className={`h-screen bg-[#FDEBD2] border-r shadow-md sticky top-0 transition-all duration-300 ${
        colapsado ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Encabezado */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            {!colapsado && (
              <h1 className="text-xl font-bold text-[#30028D] tracking-wide">KALA</h1>
            )}
            <img
              src={LogoKala}
              alt="Logo KALA"
              className={`h-10 w-auto object-contain ${colapsado ? 'mx-auto' : ''}`}
            />
          </div>

          {/* Perfil del médico */}
          <div className="flex flex-col items-center mb-4">
            <img
              src={doctor?.urlImagen || 'https://via.placeholder.com/100'}
              alt="Perfil médico"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            {!colapsado && doctor && (
              <>
                <h2 className="text-base font-bold text-[#30028D]">
                  {doctor.nombre} {doctor.apellido}
                </h2>
                <span className="text-sm text-orange-500">Médico</span>
              </>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-2">
            {opcionesMenu.map((op) => (
              <Link
                key={op.ruta}
                to={op.ruta}
                className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition ${
                  location.pathname === op.ruta
                    ? 'bg-purple-200 text-[#30028D]'
                    : 'text-gray-800 hover:bg-purple-100'
                }`}
              >
                <span className="text-lg">{op.icono}</span>
                {!colapsado && <span>{op.etiqueta}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Cerrar sesión / colapsar */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-sm text-gray-700 hover:text-black"
          >
            <FaSignOutAlt />
            {!colapsado && <span>Salir</span>}
          </button>

          <button
            onClick={() => setColapsado(!colapsado)}
            className="w-full flex justify-center items-center p-2 text-gray-600 hover:text-black transition"
          >
            {colapsado ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MenuLateralMedico;

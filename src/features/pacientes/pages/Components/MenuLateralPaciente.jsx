import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaGamepad,
  FaUserMd,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const opcionesMenu = [
  { etiqueta: 'Inicio', ruta: '/paciente/panel', icono: <FaHome /> },
  { etiqueta: 'Juegos', ruta: '/paciente/juegos', icono: <FaGamepad /> },
  { etiqueta: 'Doctor', ruta: '/paciente/doctor', icono: <FaUserMd /> },
  { etiqueta: 'Configuraciones', ruta: '/paciente/configuracion', icono: <FaCog /> },
];

const MenuLateralPaciente = ({ onLogout }) => {
  const location = useLocation();
  const [colapsado, setColapsado] = useState(false);
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [pacienteImagen, setPacienteImagen] = useState('');

  const toggleColapsado = () => setColapsado(!colapsado);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();

          if (!token || token.split('.').length !== 3) {
            throw new Error("Token JWT inválido o malformado");
          }

          // Obtener ID del paciente autenticado
          const idRes = await axios.get(
            `${API_GATEWAY}/api/pacientes/mi-perfil`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const pacienteId = idRes.data;

          // Obtener datos del paciente
          const pacienteRes = await axios.get(
            `${API_GATEWAY}/api/pacientes/${pacienteId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const paciente = pacienteRes.data;
          setPacienteNombre(paciente.nombre);
          setPacienteImagen(paciente.urlImagen);
        } catch (error) {
          console.error('Error al cargar datos del paciente:', error);
        }
      } else {
        console.error('Usuario no autenticado');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <aside
      className={`h-screen bg-[#FDEBD2] border-r shadow-md sticky top-0 transition-all duration-300 ${
        colapsado ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Sección superior: logo y perfil */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1
              className={`text-lg font-bold text-[#30028D] transition-all duration-300 ${
                colapsado ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
              }`}
            >
              KALA
            </h1>
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          </div>

          <div className="flex flex-col items-center mb-4">
            <img
              src={pacienteImagen || "/default-paciente.png"}
              alt="Paciente"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            {!colapsado && (
              <>
                <h2 className="text-base font-bold text-[#30028D]">
                  {pacienteNombre || 'Cargando...'}
                </h2>
                <span className="text-sm text-orange-500">Paciente</span>
              </>
            )}
          </div>

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

        {/* Sección inferior: cerrar sesión y colapsar */}
        <div className="p-4 space-y-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full text-sm text-gray-700 hover:text-black"
          >
            <FaSignOutAlt />
            {!colapsado && <span>Cerrar sesión</span>}
          </button>

          <button
            onClick={toggleColapsado}
            className="w-full flex justify-center items-center p-2 text-gray-600 hover:text-black transition"
          >
            {colapsado ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MenuLateralPaciente;

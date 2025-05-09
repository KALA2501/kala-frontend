import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

const opcionesMenu = [
  { etiqueta: 'Panel', ruta: '/admin/panel', icono: <FaHome /> },
  { etiqueta: 'Solicitudes', ruta: '/admin/solicitudes', icono: <FaClipboardList /> },
  { etiqueta: 'Usuarios', ruta: '/admin/usuarios', icono: <FaUsers /> },
];

const MenuLateral = ({ onLogout }) => {
  const location = useLocation();
  const [colapsado, setColapsado] = useState(false);

  const toggleColapsado = () => setColapsado(!colapsado);

  return (
    <aside
      className={`h-screen bg-[#FDEBD2] border-r shadow-md sticky top-0 transition-all duration-300 ${
        colapsado ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Sección superior: logo o título */}
        <div className="p-4">
          <h2
            className={`text-xl font-bold text-[#30028D] mb-6 transition-all duration-300 ${
              colapsado ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
            }`}
          >
            Admin
          </h2>

          {/* Navegación principal */}
          <nav className="flex flex-col gap-3">
            {opcionesMenu.map((op) => (
              <Link
                key={op.ruta}
                to={op.ruta}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition font-medium ${
                  location.pathname === op.ruta
                    ? 'bg-[#FFE1C4] text-black'
                    : 'text-gray-800 hover:bg-[#ffe9d8]'
                }`}
              >
                <span className="text-lg">{op.icono}</span>
                {!colapsado && <span>{op.etiqueta}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sección inferior: Configuración, Logout, Colapsar */}
        <div className="p-4 space-y-2">
          <Link
            to="/admin/configuracion"
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition ${
              location.pathname === '/admin/configuracion'
                ? 'bg-[#FFE1C4] text-black'
                : 'text-gray-800 hover:bg-[#ffe9d8]'
            }`}
          >
            <FaCog />
            {!colapsado && <span>Configuración</span>}
          </Link>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md font-medium text-gray-800 hover:bg-[#ffe9d8] transition"
          >
            <FaSignOutAlt />
            {!colapsado && <span>Salir</span>}
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

export default MenuLateral;

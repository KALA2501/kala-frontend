import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChartLine,
  FaUserInjured,
  FaFileSignature,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";

// Opciones del menú lateral SIN la opción de Reportes y SIN el logo de KALA
const opcionesMenu = [
  { etiqueta: "Inicio", ruta: "/medico-panel", icono: <FaHome />, descripcion: "Panel principal" },
  { etiqueta: "Métricas", ruta: "/metrics", icono: <FaChartLine />, descripcion: "Ver métricas" },
  { etiqueta: "Pacientes", ruta: "/medico-pacientes", icono: <FaUserInjured />, descripcion: "Lista de pacientes" },
  { etiqueta: "Formularios", ruta: "/formularios", icono: <FaFileSignature />, descripcion: "Gestionar formularios" },
  {
    etiqueta: "Configuración",
    ruta: "/medico-panel/configuracion",
    icono: <FaCog />,
    descripcion: "Configuración de perfil",
    animado: true, // solo para este ícono
  },
];

const MenuLateralMedico = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [colapsado, setColapsado] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(
            `${process.env.REACT_APP_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setDoctor(res.data);
        } catch (err) {
          console.error("❌ Error al obtener médico:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate("/");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <aside
      className={`h-screen border-r border-gray-200 shadow-lg sticky top-0 transition-all duration-300 ease-in-out animate-fadeInBlur ${colapsado ? "w-20" : "w-64"}`}
      style={{ backgroundColor: "#FDEBD2" }}
    >
      <div className="flex flex-col h-full justify-between relative">
        {/* Header y perfil */}
        <div className="p-4">
          {/* Ya no hay logo de KALA */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className={`text-lg font-bold text-[#30028D] transition-all duration-300 ${
                colapsado ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              KALA
            </h1>
          </div>
          {/* Perfil del médico */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={doctor?.urlImagen || "https://via.placeholder.com/100"}
              alt="Perfil médico"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            {!colapsado && doctor && (
              <>
                <h2 className="text-base font-bold text-[#30028D] text-center">
                  {doctor.nombre} {doctor.apellido}
                </h2>
                <span className="text-sm text-orange-500">Médico</span>
              </>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-3">
            {opcionesMenu.map((op, idx) => {
              const isActive = location.pathname === op.ruta;
              const isConfig = op.animado;
              return (
                <Link
                  key={op.ruta}
                  to={op.ruta}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 font-medium relative overflow-hidden w-full text-left ${
                    isActive ? "shadow-md transform scale-105" : "hover:transform hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isActive ? "#C7B8EA" : "transparent",
                    color: isActive ? "#FFFFFF" : "#666666",
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                      style={{ backgroundColor: "#F8D442" }}
                    ></div>
                  )}
                  <span
                    className={`text-lg transition-transform duration-300
                      ${isConfig && (isActive || hoveredIndex === idx)
                        ? "animate-spin-slow"
                        : ""}
                    `}
                    style={{
                      color: isActive ? "#F8D442" : "#89CCC9",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {op.icono}
                  </span>
                  {!colapsado && (
                    <div className="transition-all duration-300">
                      <span className="font-medium">{op.etiqueta}</span>
                      <p className="text-xs" style={{ color: isActive ? "#FFFFFF" : "#999999" }}>
                        {op.descripcion}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Sección inferior: logout y colapsar */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-red-50"
            style={{ color: "#666666" }}
          >
            <FaSignOutAlt className="group-hover:translate-x-1 transition-transform duration-300 text-red-500" />
            {!colapsado && <span className="group-hover:text-red-600">Salir</span>}
          </button>
          <button
            onClick={() => setColapsado(!colapsado)}
            className="w-full flex justify-center items-center p-3 rounded-lg transition-all duration-300 group hover:bg-white/50"
            style={{ color: "#89CCC9" }}
          >
            {colapsado ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
      </div>
      {/* Animación personalizada para el engranaje */}
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .animate-spin-slow {
            animation: spin-slow 1.3s linear infinite;
          }
        `}
      </style>
    </aside>
  );
};

export default MenuLateralMedico;

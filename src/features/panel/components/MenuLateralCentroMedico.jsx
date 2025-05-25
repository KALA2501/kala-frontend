import React, { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUserMd,
  FaUserInjured,
  FaUserPlus,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const opcionesMenu = [
  {
    etiqueta: "Médicos",
    ruta: "/panel?tab=medicos",
    icono: <FaUserMd />,
    descripcion: "Equipo médico",
    color: "#89CCC9",
  },
  {
    etiqueta: "Pacientes",
    ruta: "/panel?tab=pacientes",
    icono: <FaUserInjured />,
    descripcion: "Lista de pacientes",
    color: "#89CCC9",
  },
  {
    etiqueta: "Agregar Paciente",
    ruta: "/centro/agregar-paciente",
    icono: <FaUserPlus />,
    descripcion: "Nuevo paciente",
    color: "#89CCC9",
  },
  {
    etiqueta: "Configuración",
    ruta: "/panel/configuracion",
    icono: <FaCog />,
    descripcion: "Editar datos del centro",
    color: "#89CCC9", // o "#F8D442" si quieres el engranaje amarillo
  },
];

const MenuLateralCentroMedico = ({ onLogout }) => {
  const location = useLocation();
  const [colapsado, setColapsado] = useState(false);
  const [centroNombre, setCentroNombre] = useState("");
  const [centroLogo, setCentroLogo] = useState("");

  const toggleColapsado = () => setColapsado(!colapsado);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(
            `${API_GATEWAY}/api/centro-medico/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const centro = res.data;
          setCentroNombre(centro.nombre);
          setCentroLogo(centro.urlLogo);
        } catch (error) {
          // Poeta pero pragmático: ni el Quijote cargaría estos datos si no puede.
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside
      className={`h-screen border-r border-gray-200 shadow-lg sticky top-0 transition-all duration-300 ease-in-out animate-fadeInBlur ${
        colapsado ? "w-20" : "w-64"
      }`}
      style={{ backgroundColor: "#FFEFDD" }}
    >
      <div className="flex flex-col h-full justify-between relative">
        <div className="p-4">
          {/* Logo de KALA */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className={`text-lg font-bold text-[#30028D] transition-all duration-300 ${
                colapsado ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              KALA
            </h1>
           
          </div>

          {/* Logo y nombre del centro */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={
                centroLogo?.startsWith("http")
                  ? centroLogo
                  : centroLogo
                  ? `${API_GATEWAY}${centroLogo}`
                  : "/default-logo.png"
              }
              alt="Logo del Centro"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            {!colapsado && (
              <>
                <h2 className="text-base font-bold text-[#30028D] text-center">
                  {centroNombre || "Centro Médico"}
                </h2>
                <span className="text-sm text-orange-500">Centro Médico</span>
              </>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-3">
            {opcionesMenu.map((op) => {
              // Activo si coincide la ruta sin hash
              const isActive =
                location.pathname + location.search === op.ruta ||
                location.pathname === op.ruta;
              return (
                <Link
                  key={op.ruta}
                  to={op.ruta}
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
                    className="text-lg flex items-center justify-center"
                    style={{ color: isActive ? "#F8D442" : op.color }}
                  >
                    {op.icono}
                  </span>
                  {!colapsado && (
                    <div className="transition-all duration-300">
                      <span className="font-medium">{op.etiqueta}</span>
                      <p
                        className="text-xs"
                        style={{ color: isActive ? "#FFFFFF" : "#999999" }}
                      >
                        {op.descripcion}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Cerrar sesión y colapsar */}
        <div className="p-4">
          <button
            onClick={onLogout}
            className="group flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-red-50"
            style={{ color: "#666666" }}
          >
            <FaSignOutAlt className="group-hover:translate-x-1 transition-transform duration-300 text-red-500" />
            {!colapsado && <span className="group-hover:text-red-600">Salir</span>}
          </button>
          <button
            onClick={toggleColapsado}
            className="w-full flex justify-center items-center p-3 rounded-lg transition-all duration-300 group hover:bg-white/50"
            style={{ color: "#89CCC9" }}
          >
            {colapsado ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MenuLateralCentroMedico;

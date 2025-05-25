"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaChartBar,
  FaBell,
} from "react-icons/fa"

const opcionesMenu = [
  {
    etiqueta: "Panel",
    ruta: "/admin/panel",
    icono: <FaHome />,
    descripcion: "Panel principal",
  },
  {
    etiqueta: "Solicitudes",
    ruta: "/admin/solicitudes",
    icono: <FaClipboardList />,
    descripcion: "Gestionar solicitudes",
  },
  {
    etiqueta: "Usuarios",
    ruta: "/admin/usuarios",
    icono: <FaUsers />,
    descripcion: "Administrar usuarios",
  },
  {
    etiqueta: "Reportes",
    ruta: "/admin/reportes",
    icono: <FaChartBar />,
    descripcion: "Ver estadísticas",
  },
]

const MenuLateral = ({ onLogout }) => {
  const location = useLocation()
  const [colapsado, setColapsado] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  const toggleColapsado = () => setColapsado(!colapsado)

  return (
    <aside
      className={`h-screen border-r border-gray-200 shadow-lg sticky top-0 transition-all duration-300 ease-in-out animate-fadeInBlur ${
        colapsado ? "w-20" : "w-64"
      }`}
      style={{ backgroundColor: "#FFEFDD" }}
    >
      <div className="flex flex-col h-full justify-between relative">
        {/* Sección superior: logo y navegación */}
        <div className="relative z-10">
          {/* Header con logo original */}
          <div className="p-4">
            <h2
              className={`text-xl font-bold mb-6 transition-all duration-300 ${
                colapsado ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
              }`}
              style={{ color: "#C7B8EA" }}
            >
              Admin
            </h2>

            {/* Navegación principal */}
            <nav className="flex flex-col gap-3">
              {opcionesMenu.map((op, index) => {
                const isActive = location.pathname === op.ruta
                return (
                  <div key={op.ruta} className="relative">
                    <Link
                      to={op.ruta}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 font-medium relative overflow-hidden ${
                        isActive ? "shadow-md transform scale-105" : "hover:transform hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: isActive ? "#C7B8EA" : "transparent",
                        color: isActive ? "#FFFFFF" : "#666666",
                      }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                          style={{ backgroundColor: "#F8D442" }}
                        ></div>
                      )}

                      {/* Icon container */}
                      <span
                        className={`text-lg transition-all duration-300 ${
                          isActive ? "transform rotate-12" : "group-hover:transform group-hover:rotate-12"
                        }`}
                        style={{
                          color: isActive ? "#F8D442" : "#89CCC9",
                        }}
                      >
                        {op.icono}
                      </span>

                      {/* Text content */}
                      {!colapsado && (
                        <div className="transition-all duration-300">
                          <span className="font-medium">{op.etiqueta}</span>
                          <p
                            className="text-xs transition-colors"
                            style={{
                              color: isActive ? "#FFFFFF" : "#999999",
                            }}
                          >
                            {op.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Hover effect background */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                        style={{ backgroundColor: "#C7B8EA20" }}
                      ></div>
                    </Link>

                    {/* Tooltip para modo colapsado */}
                    {colapsado && hoveredItem === index && (
                      <div
                        className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg shadow-xl z-50 whitespace-nowrap animate-fadeInBlur border"
                        style={{
                          backgroundColor: "#C7B8EA",
                          color: "#FFFFFF",
                          borderColor: "#F8D442",
                        }}
                      >
                        <div className="text-sm font-medium">{op.etiqueta}</div>
                        <div className="text-xs opacity-90">{op.descripcion}</div>
                        {/* Arrow */}
                        <div
                          className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent"
                          style={{ borderRightColor: "#C7B8EA" }}
                        ></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Notificaciones section */}
          <div className="px-4 mt-6">
            <div
              className={`border rounded-lg p-4 transition-all duration-300 ${
                colapsado ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
              }`}
              style={{
                backgroundColor: "#C7B8EA20",
                borderColor: "#C7B8EA40",
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <FaBell className="animate-pulse" style={{ color: "#F8D442" }} />
                <span className="font-medium text-sm" style={{ color: "#666666" }}>
                  Notificaciones
                </span>
              </div>
              <p className="text-xs" style={{ color: "#999999" }}>
                3 solicitudes pendientes de revisión
              </p>
            </div>
          </div>
        </div>

        {/* Sección inferior: Configuración, Logout, Colapsar */}
        <div className="relative z-10 p-4 space-y-2">
          {/* Configuración */}
          <Link
            to="/admin/configuracion"
            className={`group flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
              location.pathname === "/admin/configuracion" ? "shadow-md" : ""
            }`}
            style={{
              backgroundColor: location.pathname === "/admin/configuracion" ? "#C7B8EA" : "transparent",
              color: location.pathname === "/admin/configuracion" ? "#FFFFFF" : "#666666",
            }}
          >
            <FaCog
              className="group-hover:animate-spin transition-transform duration-300"
              style={{
                color: location.pathname === "/admin/configuracion" ? "#F8D442" : "#89CCC9",
              }}
            />
            {!colapsado && <span>Configuración</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="group flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-red-50"
            style={{ color: "#666666" }}
          >
            <FaSignOutAlt className="group-hover:transform group-hover:translate-x-1 transition-transform duration-300 text-red-500" />
            {!colapsado && <span className="group-hover:text-red-600">Salir</span>}
          </button>

          {/* Toggle collapse button */}
          <button
            onClick={toggleColapsado}
            className="w-full flex justify-center items-center p-3 rounded-lg transition-all duration-300 group hover:bg-white/50"
            style={{ color: "#89CCC9" }}
          >
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              {colapsado ? <FaChevronRight /> : <FaChevronLeft />}
            </div>
          </button>

          {/* User info section */}
          <div
            className={`mt-4 transition-all duration-300 ${
              colapsado ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
            }`}
          >
            <div
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E5E5",
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: "#C7B8EA" }}
                >
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#666666" }}>
                    Administrador
                  </p>
                  <p className="text-xs truncate" style={{ color: "#999999" }}>
                    admin@kala.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute top-20 right-4 w-2 h-2 rounded-full opacity-60 animate-pulse"
          style={{ backgroundColor: "#F8D442" }}
        ></div>
        <div
          className="absolute top-32 right-6 w-1 h-1 rounded-full opacity-40 animate-pulse delay-1000"
          style={{ backgroundColor: "#89CCC9" }}
        ></div>
        <div
          className="absolute bottom-32 right-4 w-1.5 h-1.5 rounded-full opacity-50 animate-pulse delay-500"
          style={{ backgroundColor: "#C7B8EA" }}
        ></div>
      </div>
    </aside>
  )
}

export default MenuLateral

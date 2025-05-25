import { useState } from "react"
import {
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa"

const opcionesMenu = [
  {
    etiqueta: "Usuarios",
    tab: "usuarios",
    icono: <FaUsers />,
    descripcion: "Administrar usuarios",
  },
  {
    etiqueta: "Solicitudes",
    tab: "solicitudes",
    icono: <FaClipboardList />,
    descripcion: "Gestionar solicitudes",
  },
]

const MenuLateral = ({ onLogout, activeTab, setActiveTab }) => {
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
        {/* Header */}
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
              const isActive = activeTab === op.tab
              return (
                <button
                  key={op.etiqueta}
                  onClick={() => setActiveTab(op.tab)}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
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
                    className={`text-lg transition-all duration-300 ${
                      isActive ? "transform rotate-12" : "group-hover:transform group-hover:rotate-12"
                    }`}
                    style={{
                      color: isActive ? "#F8D442" : "#89CCC9",
                    }}
                  >
                    {op.icono}
                  </span>

                  {!colapsado && (
                    <div className="transition-all duration-300">
                      <span className="font-medium">{op.etiqueta}</span>
                      <p
                        className="text-xs transition-colors"
                        style={{ color: isActive ? "#FFFFFF" : "#999999" }}
                      >
                        {op.descripcion}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer: Logout y colapsar */}
        <div className="p-4 space-y-2">
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
  )
}

export default MenuLateral

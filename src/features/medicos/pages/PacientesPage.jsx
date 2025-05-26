"use client"

import { useEffect, useState } from "react"
import MenuLateralMedico from "./components/MenuLateralMedico"
import { getAuth } from "firebase/auth"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Search, TrendingUp, Phone, FileText, HelpCircle, UserPlus, Download, Eye } from "lucide-react"

const API_PACIENTES = `${process.env.REACT_APP_GATEWAY}/api/pacientes/del-medico`

// Función para generar color de avatar basado en el nombre
const getAvatarColor = (name) => {
  const colors = ["#C7B8EA", "#89CCC9", "#F8D442", "#FEAF00", "#FFEED0", "#E5E5E5"]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// Función para obtener las iniciales
const getInitials = (nombre, apellido) => {
  return `${nombre?.charAt(0) || ""}${apellido?.charAt(0) || ""}`.toUpperCase()
}

// Componente de Avatar
const PatientAvatar = ({ nombre, apellido, size = "w-12 h-12" }) => {
  const initials = getInitials(nombre, apellido)
  const backgroundColor = getAvatarColor(nombre || "A")

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  )
}

// Componente de Tutorial
const TutorialOverlay = ({ isOpen, onClose, currentStep, setCurrentStep }) => {
  const steps = [
    {
      title: "👋 Gestión de Pacientes",
      content:
        "Bienvenido a la gestión de pacientes. Aquí puedes ver y administrar todos los pacientes vinculados a tu cuenta médica.",
    },
    {
      title: "📊 Estadísticas Rápidas",
      content: "Estas tarjetas muestran un resumen rápido de la información de tus pacientes registrados.",
    },
    {
      title: "🔍 Búsqueda y Filtros",
      content: "Utiliza estos controles para encontrar pacientes específicos por nombre, apellido o documento.",
    },
    {
      title: "👥 Lista de Pacientes",
      content: "Cada tarjeta muestra la información del paciente con acceso rápido a sus detalles.",
    },
  ]

  if (!isOpen) return null

  const currentStepData = steps[currentStep]

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border" style={{ borderColor: "#E5E5E5" }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#666666" }}>
                {currentStepData.title}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
                ✕
              </button>
            </div>

            <p className="mb-6" style={{ color: "#999999" }}>
              {currentStepData.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: index === currentStep ? "#C7B8EA" : "#E5E5E5",
                    }}
                  ></div>
                ))}
              </div>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-4 py-2 rounded-lg border"
                    style={{ borderColor: "#E5E5E5", color: "#666666" }}
                  >
                    Anterior
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#C7B8EA" }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#89CCC9" }}
                  >
                    ¡Entendido!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Componente de Menú de Ayuda
const HelpMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border p-6 w-72"
      style={{ borderColor: "#E5E5E5" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
            <span className="text-xl">🏥</span>
          </div>
          <div>
            <h4 className="font-bold text-lg" style={{ color: "#666666" }}>
              Centro de Ayuda
            </h4>
            <p className="text-xs" style={{ color: "#999999" }}>
              Gestión de Pacientes
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 rounded-xl" style={{ backgroundColor: "#C7B8EA10" }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA" }}>
            <span className="text-white text-sm">🔍</span>
          </div>
          <div className="text-left">
            <p className="font-medium text-sm" style={{ color: "#666666" }}>
              Buscar pacientes
            </p>
            <p className="text-xs" style={{ color: "#999999" }}>
              Por nombre, apellido o documento
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl" style={{ backgroundColor: "#89CCC910" }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC9" }}>
            <span className="text-white text-sm">👥</span>
          </div>
          <div className="text-left">
            <p className="font-medium text-sm" style={{ color: "#666666" }}>
              Agregar paciente
            </p>
            <p className="text-xs" style={{ color: "#999999" }}>
              Registrar nuevo paciente
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl" style={{ backgroundColor: "#F8D44210" }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#F8D442" }}>
            <span className="text-white text-sm">📄</span>
          </div>
          <div className="text-left">
            <p className="font-medium text-sm" style={{ color: "#666666" }}>
              Exportar datos
            </p>
            <p className="text-xs" style={{ color: "#999999" }}>
              Descargar lista de pacientes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const PacientesPage = () => {
  const [pacientes, setPacientes] = useState([])
  const [filteredPacientes, setFilteredPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("nombre")
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true)
      setError("")
      try {
        const user = getAuth().currentUser
        if (!user) throw new Error("No hay usuario autenticado.")
        const token = await user.getIdToken()
        const res = await axios.get(API_PACIENTES, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setPacientes(res.data)
        setFilteredPacientes(res.data)
      } catch (err) {
        setError("Error al cargar pacientes vinculados. Verifica tu autenticación.")
      } finally {
        setLoading(false)
      }
    }

    fetchPacientes()
  }, [])

  // Filtrar y ordenar pacientes
  useEffect(() => {
    const filtered = pacientes.filter((paciente) => {
      const matchesSearch =
        paciente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.idDocumento?.includes(searchTerm)

      return matchesSearch
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "apellido":
          return (a.apellido || "").localeCompare(b.apellido || "")
        default:
          return (a.nombre || "").localeCompare(b.nombre || "")
      }
    })

    setFilteredPacientes(filtered)
  }, [pacientes, searchTerm, sortBy])

  const handleVerPaciente = (pacienteId) => {
    navigate(`/pacientes/${pacienteId}`)
  }

  const handleAgregarPaciente = () => {
    navigate("/register-patient")
  }

  const handleExportarPacientes = () => {
    console.log("Exportando pacientes...")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-4"
            style={{
              borderColor: "#E5E5E5",
              borderTopColor: "#C7B8EA",
            }}
          ></div>
          <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
            Cargando pacientes...
          </h2>
          <p className="mt-2" style={{ color: "#999999" }}>
            Por favor espera un momento
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <MenuLateralMedico />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: "#C7B8EA" }}>
                <span className="text-white text-2xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Gestión de Pacientes
                </h1>
                <p style={{ color: "#999999" }}>Administra y supervisa el progreso de tus pacientes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAgregarPaciente}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white shadow-lg hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: "#C7B8EA" }}
              >
                <UserPlus className="h-5 w-5" />
                <span>Agregar Paciente</span>
              </button>

              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white shadow-lg hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: "#F8D442" }}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Tutorial</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border"
            style={{ borderColor: "#E5E5E5" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "#999999" }}>
                  Total Pacientes
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                  {pacientes.length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#C7B8EA20" }}>
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border"
            style={{ borderColor: "#E5E5E5" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "#999999" }}>
                  Con Documento
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                  {pacientes.filter((p) => p.idDocumento).length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#89CCC920" }}>
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border"
            style={{ borderColor: "#E5E5E5" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "#999999" }}>
                  Con Teléfono
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                  {pacientes.filter((p) => p.telefono).length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#F8D44220" }}>
                <span className="text-2xl">📞</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-lg border p-6 mb-8" style={{ borderColor: "#E5E5E5" }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ borderColor: "#E5E5E5", focusRingColor: "#C7B8EA" }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                  style={{ borderColor: "#E5E5E5" }}
                >
                  <option value="nombre">Ordenar por nombre</option>
                  <option value="apellido">Ordenar por apellido</option>
                </select>
              </div>

              <button
                onClick={handleExportarPacientes}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: "#FFFFFF", color: "#666666", borderColor: "#E5E5E5" }}
              >
                <Download className="h-5 w-5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Manejo de errores */}
        {error && (
          <div className="mb-6">
            <div
              className="p-4 rounded-xl border-l-4 shadow-md"
              style={{
                backgroundColor: "#FEF2F2",
                borderLeftColor: "#EF4444",
                color: "#DC2626",
              }}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                <div>
                  <h3 className="font-semibold">Error al cargar pacientes</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de pacientes */}
        <div>
          {filteredPacientes.length === 0 && !error ? (
            <div className="bg-white rounded-xl shadow-lg border p-12 text-center" style={{ borderColor: "#E5E5E5" }}>
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "#666666" }}>
                {searchTerm ? "No se encontraron pacientes" : "No hay pacientes vinculados"}
              </h3>
              <p className="mb-6" style={{ color: "#999999" }}>
                {searchTerm
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando tu primer paciente al sistema"}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAgregarPaciente}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white shadow-lg hover:scale-105 transition-all duration-200 mx-auto"
                  style={{ backgroundColor: "#C7B8EA" }}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Agregar Primer Paciente</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPacientes.map((paciente) => (
                <div
                  key={paciente.pkId}
                  className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200"
                  style={{ borderColor: "#E5E5E5" }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <PatientAvatar nombre={paciente.nombre} apellido={paciente.apellido} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" style={{ color: "#666666" }}>
                        {paciente.nombre} {paciente.apellido}
                      </h3>
                      <p className="flex items-center text-sm" style={{ color: "#999999" }}>
                        <FileText className="h-4 w-4 mr-1" />
                        {paciente.idDocumento}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm" style={{ color: "#999999" }}>
                      <Phone className="h-4 w-4 mr-2" />
                      {paciente.telefono || "No especificado"}
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerPaciente(paciente.pkId)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white shadow hover:scale-105 transition-all duration-200"
                    style={{ backgroundColor: "#89CCC9" }}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver Paciente</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredPacientes.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-lg shadow-sm border px-4 py-2" style={{ borderColor: "#E5E5E5" }}>
              <span className="text-sm" style={{ color: "#999999" }}>
                Mostrando {filteredPacientes.length} de {pacientes.length} pacientes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        currentStep={tutorialStep}
        setCurrentStep={setTutorialStep}
      />

      {/* Botón flotante de ayuda */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative">
          <button
            onClick={() => setShowHelpMenu(!showHelpMenu)}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl"
            style={{ backgroundColor: "#89CCC9" }}
          >
            <span className="text-xl font-bold">?</span>
          </button>

          {showHelpMenu && <HelpMenu isOpen={showHelpMenu} onClose={() => setShowHelpMenu(false)} />}
        </div>
      </div>
    </div>
  )
}

export default PacientesPage

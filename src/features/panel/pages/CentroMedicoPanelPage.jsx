"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useLocation, useNavigate } from "react-router-dom"

import CentroMedicoNavbar from "../components/CentroMedicoNavbar"
import CentroMedicoFooter from "../components/CentroMedicoFooter"
import CentroMedicoTableMedicos from "../components/CentroMedicoTableMedicos"
import CentroMedicoTablePacientes from "../components/CentroMedicoTablePacientes"
import CentroMedicoFormMedico from "../components/CentroMedicoFormMedico"
import { subirImagen } from "../../../services/firebase"
import MenuLateralCentroMedico from "../components/MenuLateralCentroMedico"

// Componente de ayuda y tutorial
const HelpSystem = ({ isOpen, onClose, currentStep, setCurrentStep, totalSteps }) => {
  const helpSteps = [
    {
      title: "📊 Panel de Estadísticas",
      content:
        "Aquí puedes ver un resumen rápido de tu centro: total de médicos, pacientes y información del centro activo.",
    },
    {
      title: "➕ Agregar Personal",
      content:
        "Usa los botones 'Agregar Médico' y 'Agregar Paciente' para registrar nuevo personal en tu centro médico.",
    },
    {
      title: "🔄 Navegación por Pestañas",
      content:
        "Cambia entre la vista de médicos y pacientes usando las pestañas. Los números muestran la cantidad actual registrada.",
    },
    {
      title: "📋 Gestión de Datos",
      content:
        "En las tablas puedes ver, editar y eliminar la información de médicos o pacientes según la pestaña activa.",
    },
  ]

  const currentStepData = helpSteps[currentStep]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>

      {/* Tour Modal */}
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
                {helpSteps.map((_, index) => (
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

                {currentStep < totalSteps - 1 ? (
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

const API_GATEWAY = process.env.REACT_APP_GATEWAY

const CentroMedicoPanelPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Leer el tab activo de la URL, por defecto "medicos"
  const params = new URLSearchParams(location.search)
  const activeTab = params.get("tab") || "medicos"

  const [medicos, setMedicos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [centro, setCentro] = useState(null)
  const [logo, setLogo] = useState("")
  const [logoSubido, setLogoSubido] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Estados para el sistema de ayuda
  const [showHelp, setShowHelp] = useState(false)
  const [helpStep, setHelpStep] = useState(0)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    idDocumento: "",
    fechaNacimiento: "",
    profesion: "Médico",
    especialidad: "General",
    especialidadCustom: "",
    telefono: "",
    direccion: "",
    genero: "",
    tarjetaProfesional: "",
    urlLogo: "",
    correo: "",
  })

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email
        const token = await user.getIdToken()
        try {
          const res = await axios.get(
            `${API_GATEWAY}/api/centro-medico/buscar-por-correo?correo=${encodeURIComponent(email)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          const centroData = res.data
          setCentro(centroData)
          const centroId = centroData.pkId
          localStorage.setItem("idCentro", centroId)
          cargarDatos(centroId, token)
        } catch (error) {
          console.error("Error al obtener centro:", error)
          setMensaje("❌ No se pudo identificar el centro médico")
        }
      } else {
        window.location.href = "/"
      }
    })

    return () => unsubscribe()
  }, [])

  const cargarDatos = async (idCentro, token) => {
    try {
      setLoading(true)
      const [medicosRes, pacientesRes] = await Promise.all([
        axios.get(`${API_GATEWAY}/api/medicos/centro-medico/${idCentro}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_GATEWAY}/api/pacientes/centro-medico/${idCentro}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setMedicos(medicosRes.data)
      setPacientes(pacientesRes.data)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setMensaje("❌ Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEspecialidadChange = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      especialidad: value,
      especialidadCustom: value === "Otra" ? prev.especialidadCustom : "",
    }))
  }

  const handleLogoCentro = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    try {
      const url = await subirImagen(archivo, "centros-medicos")
      setLogo(url)
      setLogoSubido(true)
      setFormData((prev) => ({ ...prev, urlLogo: url }))
    } catch (error) {
      console.error("Error subiendo logo", error)
      setMensaje("❌ Error al subir el logo")
    }
  }

  const handleImagenMedico = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    try {
      const url = await subirImagen(archivo, "medicos")
      setLogo(url)
      setLogoSubido(true)
      setFormData((prev) => ({ ...prev, urlLogo: url }))
    } catch (error) {
      console.error("Error subiendo imagen del médico", error)
      setMensaje("❌ Error al subir la imagen del médico")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!logoSubido || !logo) {
      setMensaje("❌ Debes subir la imagen del médico antes de continuar")
      return
    }
    try {
      const auth = getAuth()
      const user = auth.currentUser
      const token = await user.getIdToken()

      let especialidadFinal = formData.especialidad
      if (especialidadFinal === "Otra" && formData.especialidadCustom.trim() !== "") {
        especialidadFinal = formData.especialidadCustom.trim()
      }

      const medicoAEnviar = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipoDocumento: { id: formData.tipoDocumento },
        idDocumento: formData.idDocumento,
        fechaNacimiento: new Date(formData.fechaNacimiento + "T00:00:00").toISOString(),
        profesion: "Médico",
        especialidad: especialidadFinal,
        telefono: formData.telefono,
        direccion: formData.direccion,
        genero: formData.genero,
        tarjetaProfesional: formData.tarjetaProfesional,
        urlImagen: logo,
        correo: formData.correo,
        centroMedico: { pkId: centro.pkId },
      }

      await axios.post(`${API_GATEWAY}/api/medicos`, medicoAEnviar, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setMensaje("✅ Médico creado exitosamente")
      setShowForm(false)
      setFormData({
        nombre: "",
        apellido: "",
        tipoDocumento: "CC",
        idDocumento: "",
        fechaNacimiento: "",
        profesion: "Médico",
        especialidad: "General",
        especialidadCustom: "",
        telefono: "",
        direccion: "",
        genero: "",
        tarjetaProfesional: "",
        urlLogo: "",
        correo: "",
      })
      setLogo("")
      setLogoSubido(false)

      const idCentro = localStorage.getItem("idCentro")
      cargarDatos(idCentro, token)
    } catch (error) {
      console.error("Error al crear el médico:", error.response?.data || error.message)
      setMensaje(`❌ ${error.response?.data || "Error al crear el médico"}`)
    }
  }

  const handleLogout = async () => {
    const auth = getAuth()
    await auth.signOut()
    localStorage.removeItem("idCentro")
    window.location.href = "/"
  }

  const eliminarMedico = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este médico?")) return
    try {
      const auth = getAuth()
      const user = auth.currentUser
      const token = await user.getIdToken()
      await axios.delete(`${API_GATEWAY}/api/medicos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMensaje("✅ Médico eliminado")
      const idCentro = localStorage.getItem("idCentro")
      cargarDatos(idCentro, token)
    } catch (error) {
      console.error(error)
      setMensaje(`❌ ${error.response?.data || "Error al eliminar el médico"}`)
    }
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
            Cargando panel del centro médico...
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
      <MenuLateralCentroMedico onLogout={handleLogout} centroNombre={centro?.nombre} centroLogo={centro?.urlLogo} />

      <div className="flex-1 flex flex-col">
        <CentroMedicoNavbar nombreCentro={centro?.nombre || "Centro Médico"} onLogout={handleLogout} />

        {/* Mensajes de alerta */}
        {mensaje && (
          <div className="max-w-7xl mx-auto mt-6 px-6">
            <div
              className="p-4 rounded-xl border-l-4 shadow-md"
              style={{
                backgroundColor: mensaje.includes("❌") ? "#FEF2F2" : "#F0FDF4",
                borderLeftColor: mensaje.includes("❌") ? "#EF4444" : "#22C55E",
                color: mensaje.includes("❌") ? "#DC2626" : "#16A34A",
              }}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{mensaje.includes("❌") ? "⚠️" : "✅"}</span>
                <p className="font-medium">{mensaje}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cards de estadísticas */}
        <div className="max-w-7xl mx-auto mt-8 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border"
              style={{ borderColor: "#E5E5E5" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "#999999" }}>
                    Total Médicos
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                    {medicos.length}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: "#C7B8EA20" }}>
                  <span className="text-2xl">👨‍⚕️</span>
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
                    Total Pacientes
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                    {pacientes.length}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: "#89CCC920" }}>
                  <span className="text-2xl">👤</span>
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
                    Centro Activo
                  </p>
                  <p className="text-lg font-bold mt-2" style={{ color: "#666666" }}>
                    {centro?.nombre || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: "#F8D44220" }}>
                  <span className="text-2xl">🏥</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto px-6">
          {/* Botones para agregar médico y paciente */}
          <div className="flex justify-end mb-6 gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: showForm ? "#EF4444" : "#C7B8EA",
                color: "#FFFFFF",
              }}
            >
              <span>{showForm ? "❌" : "➕"}</span>
              <span>{showForm ? "Cancelar" : "Agregar Médico"}</span>
            </button>
            <button
              onClick={() => navigate("/centro/agregar-paciente")}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: "#C7B8EA",
                color: "#FFFFFF",
              }}
            >
              <span>➕</span>
              <span>Agregar Paciente</span>
            </button>
          </div>

          {/* Formulario para agregar médico */}
          {showForm && (
            <div className="mb-8">
              <div
                className="bg-white rounded-xl shadow-lg border p-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                    <span className="text-xl">👨‍⚕️</span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: "#666666" }}>
                    Agregar Nuevo Médico
                  </h3>
                </div>
                <CentroMedicoFormMedico
                  formData={formData}
                  handleChange={handleChange}
                  handleEspecialidadChange={handleEspecialidadChange}
                  handleImagenMedico={handleImagenMedico}
                  handleSubmit={handleSubmit}
                  logo={logo}
                />
              </div>
            </div>
          )}

          {/* Navegación de pestañas */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-2 border" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate("/panel?tab=medicos")}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === "medicos" ? "#C7B8EA" : "transparent",
                    color: activeTab === "medicos" ? "#FFFFFF" : "#666666",
                  }}
                >
                  <span>👨‍⚕️</span>
                  <span>Médicos ({medicos.length})</span>
                </button>
                <button
                  onClick={() => navigate("/panel?tab=pacientes")}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === "pacientes" ? "#C7B8EA" : "transparent",
                    color: activeTab === "pacientes" ? "#FFFFFF" : "#666666",
                  }}
                >
                  <span>👤</span>
                  <span>Pacientes ({pacientes.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido de las pestañas */}
          <div className="mb-16">
            {activeTab === "medicos" ? (
              <div
                className="bg-white rounded-xl shadow-lg border animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <div className="p-6 border-b" style={{ borderBottomColor: "#E5E5E5" }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                      <span className="text-xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
                        Médicos Registrados
                      </h2>
                      <p style={{ color: "#999999" }}>Gestiona el equipo médico de tu centro</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <CentroMedicoTableMedicos medicos={medicos} eliminarMedico={eliminarMedico} />
                </div>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl shadow-lg border animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <div className="p-6 border-b" style={{ borderBottomColor: "#E5E5E5" }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC920" }}>
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
                        Pacientes Registrados
                      </h2>
                      <p style={{ color: "#999999" }}>Consulta la información de los pacientes</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <CentroMedicoTablePacientes pacientes={pacientes} />
                </div>
              </div>
            )}
          </div>
        </main>

        <CentroMedicoFooter />
      </div>

      {/* Sistema de ayuda */}
      {showHelp && (
        <HelpSystem
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          currentStep={helpStep}
          setCurrentStep={setHelpStep}
          totalSteps={4}
        />
      )}

      {/* Botón flotante de ayuda mejorado */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative">
          <button
            onClick={() => setShowQuickHelp(!showQuickHelp)}
            className="group relative w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl"
            style={{
              backgroundColor: "#C7B8EA",
              background: "linear-gradient(135deg, #C7B8EA 0%, #89CCC9 100%)",
            }}
          >
            {/* Icono principal */}
            <div className="relative z-10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform duration-300 group-hover:rotate-12"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Efecto de pulso */}
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: "#C7B8EA" }}
            ></div>

            {/* Borde brillante */}
            <div className="absolute inset-0 rounded-full border-2 opacity-30" style={{ borderColor: "#F8D442" }}></div>
          </button>

          {/* Tooltip cuando no está abierto el menú */}
          {!showQuickHelp && (
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                ¿Necesitas ayuda?
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}

          {/* Menú de ayuda mejorado */}
          {showQuickHelp && (
            <div
              className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border p-6 w-72 animate-fadeInBlur"
              style={{ borderColor: "#E5E5E5" }}
            >
              {/* Header del menú */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="#C7B8EA"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: "#666666" }}>
                      Centro de Ayuda
                    </h4>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Estamos aquí para ayudarte
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Opciones de ayuda */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowHelp(true)
                    setHelpStep(0)
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#C7B8EA10", border: "1px solid #C7B8EA20" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 6.042A9.02 9.02 0 0 1 12 6a9.02 9.02 0 0 1 0 .042m0 0a8.97 8.97 0 0 1 3.834.808 9.003 9.003 0 0 1 4.316 4.316A8.97 8.97 0 0 1 21 15a8.97 8.97 0 0 1-.85 3.834 9.003 9.003 0 0 1-4.316 4.316A8.97 8.97 0 0 1 12 24a8.97 8.97 0 0 1-3.834-.85 9.003 9.003 0 0 1-4.316-4.316A8.97 8.97 0 0 1 3 15a8.97 8.97 0 0 1 .85-3.834 9.003 9.003 0 0 1 4.316-4.316A8.97 8.97 0 0 1 12 6.042Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Tutorial Completo
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Aprende a usar todas las funciones
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowForm(true)
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#89CCC910", border: "1px solid #89CCC920" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC9" }}>
                    <span className="text-white text-sm">👨‍⚕️</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Agregar Médico
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Registrar nuevo personal médico
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate("/centro/agregar-paciente")
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#F8D44210", border: "1px solid #F8D44220" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#F8D442" }}>
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Agregar Paciente
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Registrar nuevo paciente
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate("/centro/configuracion")
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#FEAF0010", border: "1px solid #FEAF0020" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#FEAF00" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="white" />
                      <path
                        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Configuración
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Ajustar configuración del centro
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer del menú */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
                <p className="text-xs text-center" style={{ color: "#999999" }}>
                  ¿Necesitas más ayuda? Contacta a soporte técnico
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CentroMedicoPanelPage

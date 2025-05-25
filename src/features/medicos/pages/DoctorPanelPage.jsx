"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import MenuLateralMedico from "./components/MenuLateralMedico"

// Componente de ayuda y tutorial
const HelpSystem = ({ isOpen, onClose, currentStep, setCurrentStep, totalSteps }) => {
  const helpSteps = [
    {
      title: "👋 Panel Principal",
      content:
        "Bienvenido a tu panel de médico. Aquí puedes ver un resumen de tus pacientes activos y acceder a todas las funciones principales.",
    },
    {
      title: "📊 Resultados Recientes",
      content:
        "Esta tabla muestra los últimos resultados y actividades de tus pacientes, incluyendo etapas de tratamiento y errores registrados.",
    },
    {
      title: "👥 Pacientes Activos",
      content: "Aquí puedes ver el número total de pacientes que tienes a tu cargo y su estado actual.",
    },
    {
      title: "🔧 Acciones Rápidas",
      content: "Usa estos botones para registrar nuevos pacientes o ver reportes detallados de evaluaciones Lawton.",
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

const DoctorPanelPage = () => {
  const navigate = useNavigate()
  const [doctorImage, setDoctorImage] = useState("")
  const [pacientes, setPacientes] = useState([])
  const [medico, setMedico] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState("")

  // Estados para el seguimiento de formularios completados
  const [completados, setCompletados] = useState({})
  const [totalFormularios, setTotalFormularios] = useState(0)
  const [formulariosCompletados, setFormulariosCompletados] = useState(0)

  // Estados para el sistema de ayuda
  const [showHelp, setShowHelp] = useState(false)
  const [helpStep, setHelpStep] = useState(0)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken()
          const res = await axios.get(
            `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          const doctorData = res.data
          setDoctorImage(doctorData.urlImagen)
          setMedico(doctorData)
        } catch (err) {
          console.error("❌ Error obteniendo médico:", err)
          setMensaje("❌ Error al cargar información del médico")
        } finally {
          setLoading(false)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchPacientes = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user && medico) {
        const token = await user.getIdToken()
        try {
          const res = await axios.get(`${API_GATEWAY}/api/pacientes/del-medico`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setPacientes(res.data)

          // Verificar estado de formularios para cada paciente
          const status = {}
          let totalForms = 0
          let completedForms = 0

          for (const paciente of res.data) {
            const id = paciente.pkId
            const [lawton, dad, faq] = await Promise.allSettled([
              axios.get(`${API_GATEWAY}/api/formularios/lawton/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API_GATEWAY}/api/formularios/dad/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API_GATEWAY}/api/formularios/faq/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ])

            const lawtonCompleto = lawton.status === "fulfilled"
            const dadCompleto = dad.status === "fulfilled"
            const faqCompleto = faq.status === "fulfilled"

            status[id] = {
              lawton: lawtonCompleto,
              dad: dadCompleto,
              faq: faqCompleto,
              total: (lawtonCompleto ? 1 : 0) + (dadCompleto ? 1 : 0) + (faqCompleto ? 1 : 0),
            }

            totalForms += 3 // 3 formularios por paciente
            completedForms += status[id].total
          }

          setCompletados(status)
          setTotalFormularios(totalForms)
          setFormulariosCompletados(completedForms)
        } catch (err) {
          console.error("❌ Error obteniendo pacientes:", err)
          setMensaje("❌ Error al cargar pacientes")
        }
      }
    }
    if (medico) {
      fetchPacientes()
    }
  }, [medico])

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
            Cargando panel del médico...
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

      <main className="flex-1 p-8">
        {/* Header del panel */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: "#C7B8EA" }}>
                <span className="text-white text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Bienvenido, Dr. {medico?.nombre || "Médico"}
                </h1>
                <p style={{ color: "#999999" }}>Panel de gestión médica - {medico?.especialidad || "Especialista"}</p>
              </div>
            </div>
            {doctorImage && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium" style={{ color: "#666666" }}>
                    {medico?.nombre} {medico?.apellido}
                  </p>
                  <p className="text-sm" style={{ color: "#999999" }}>
                    {medico?.especialidad}
                  </p>
                </div>
                <img
                  src={doctorImage || "/placeholder.svg"}
                  alt="Perfil del médico"
                  className="w-16 h-16 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: "#C7B8EA" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mensajes de alerta */}
        {mensaje && (
          <div className="mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border"
            style={{ borderColor: "#E5E5E5" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "#999999" }}>
                  Pacientes Activos
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                  {pacientes.length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#89CCC920" }}>
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
                  Formularios Completados
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                  {formulariosCompletados}/{totalFormularios}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#C7B8EA20" }}>
                <span className="text-2xl">📋</span>
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
                  Reportes Pendientes
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                  {totalFormularios - formulariosCompletados}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "#F8D44220" }}>
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Tabla de resultados recientes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border" style={{ borderColor: "#E5E5E5" }}>
              <div className="p-6 border-b" style={{ borderBottomColor: "#E5E5E5" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: "#666666" }}>
                        Resultados Recientes
                      </h2>
                      <p style={{ color: "#999999" }}>Últimas actividades de tus pacientes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {pacientes.length === 0 ? (
                  <div className="text-center py-12" style={{ color: "#999999" }}>
                    <span className="text-6xl mb-4 block">👥</span>
                    <h3 className="text-xl font-semibold mb-2">No hay pacientes registrados</h3>
                    <p>Comienza registrando tu primer paciente</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: "#F8F8F8" }}>
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                            Paciente
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                            Etapa
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                            Actividad
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "#E5E5E5" }}>
                        {pacientes.slice(0, 5).map((paciente) => {
                          const estadoFormularios = completados[paciente.pkId]
                          const formulariosPendientes = estadoFormularios ? 3 - estadoFormularios.total : 3

                          return (
                            <tr key={paciente.pkId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={paciente.urlImagen || "/placeholder.svg?height=32&width=32"}
                                    alt="Paciente"
                                    className="w-8 h-8 rounded-full object-cover border"
                                    style={{ borderColor: "#E5E5E5" }}
                                  />
                                  <div>
                                    <p className="font-medium" style={{ color: "#666666" }}>
                                      {paciente.nombre} {paciente.apellido}
                                    </p>
                                    <p className="text-sm" style={{ color: "#999999" }}>
                                      ID: {paciente.idDocumento}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col space-y-1">
                                  {estadoFormularios?.lawton && (
                                    <span
                                      className="px-2 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: "#F0FDF4",
                                        color: "#16A34A",
                                      }}
                                    >
                                      Lawton ✓
                                    </span>
                                  )}
                                  {estadoFormularios?.faq && (
                                    <span
                                      className="px-2 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: "#F0FDF4",
                                        color: "#16A34A",
                                      }}
                                    >
                                      FAQ ✓
                                    </span>
                                  )}
                                  {estadoFormularios?.dad && (
                                    <span
                                      className="px-2 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: "#F0FDF4",
                                        color: "#16A34A",
                                      }}
                                    >
                                      DAD ✓
                                    </span>
                                  )}
                                  {!estadoFormularios && (
                                    <span
                                      className="px-2 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: "#FEF3C7",
                                        color: "#D97706",
                                      }}
                                    >
                                      Sin formularios
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm" style={{ color: "#666666" }}>
                                {estadoFormularios ? `${estadoFormularios.total}/3 Completados` : "0/3 Completados"}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: formulariosPendientes === 0 ? "#F0FDF4" : "#FEF3C7",
                                    color: formulariosPendientes === 0 ? "#16A34A" : "#D97706",
                                  }}
                                >
                                  {formulariosPendientes === 0 ? "Completo" : `${formulariosPendientes} Pendientes`}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral de información */}
          <div className="space-y-6">
            {/* Información del médico */}
            <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#F8D44220" }}>
                  <span className="text-xl">👨‍⚕️</span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: "#666666" }}>
                  Mi Información
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p style={{ color: "#999999" }}>Especialidad:</p>
                  <p className="font-medium" style={{ color: "#666666" }}>
                    {medico?.especialidad || "No especificada"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#999999" }}>Tarjeta Profesional:</p>
                  <p className="font-medium" style={{ color: "#666666" }}>
                    {medico?.tarjetaProfesional || "No registrada"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#999999" }}>Centro Médico:</p>
                  <p className="font-medium" style={{ color: "#666666" }}>
                    {medico?.centroMedico?.nombre || "No asignado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC920" }}>
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: "#666666" }}>
                  Acciones Rápidas
                </h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/register-patient", { state: { medico } })}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#C7B8EA", color: "#FFFFFF" }}
                >
                  <span>➕</span>
                  <span>Registrar Paciente</span>
                </button>
                <button
                  onClick={() => navigate("/lawton-reportes")}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#89CCC9", color: "#FFFFFF" }}
                >
                  <span>📄</span>
                  <span>Ver Reportes Lawton</span>
                </button>
                <button
                  onClick={() => navigate("/doctor/configuracion")}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 border"
                  style={{ backgroundColor: "#FFFFFF", color: "#666666", borderColor: "#E5E5E5" }}
                >
                  <span>⚙️</span>
                  <span>Configuración</span>
                </button>
                <button
                  onClick={() => navigate("/formularios")}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#F8D442", color: "#FFFFFF" }}
                >
                  <span>📝</span>
                  <span>Gestionar Formularios</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      {/* Botón flotante de ayuda */}
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

          {/* Menú de ayuda */}
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
                      Panel del Médico
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
                    <span className="text-white text-sm">📖</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Tutorial Completo
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Aprende a usar el panel médico
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate("/register-patient", { state: { medico } })
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#89CCC910", border: "1px solid #89CCC920" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC9" }}>
                    <span className="text-white text-sm">👥</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Registrar Paciente
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Agregar nuevo paciente
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate("/lawton-reportes")
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#F8D44210", border: "1px solid #F8D44220" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#F8D442" }}>
                    <span className="text-white text-sm">📄</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Reportes Lawton
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Ver evaluaciones y reportes
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

export default DoctorPanelPage

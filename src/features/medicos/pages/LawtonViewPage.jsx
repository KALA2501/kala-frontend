"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import MenuLateralMedico from "./components/MenuLateralMedico"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Componente de ayuda médico profesional
const HelpSystem = ({ isOpen, onClose, currentStep, setCurrentStep, totalSteps }) => {
  const helpSteps = [
    {
      title: "📋 Evaluación Lawton-Brody",
      content:
        "Esta página muestra las evaluaciones de actividades instrumentales de la vida diaria (AIVD) de tus pacientes usando la escala Lawton-Brody.",
    },
    {
      title: "📊 Interpretación de Resultados",
      content:
        "Cada evaluación muestra 8 actividades clave. Los checkmarks verdes indican independencia, las X rojas indican dependencia o dificultad.",
    },
    {
      title: "📈 Historial de Evaluaciones",
      content: "Puedes revisar evaluaciones anteriores para observar la evolución del paciente a lo largo del tiempo.",
    },
    {
      title: "📄 Generar Reportes",
      content:
        "Usa el botón de descarga para generar un PDF profesional de la evaluación que puedes compartir o archivar.",
    },
  ]

  const currentStepData = helpSteps[currentStep]

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border" style={{ borderColor: "#E5E5E5" }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#333333" }}>
                {currentStepData.title}
              </h3>
              <button onClick={onClose} style={{ color: "#999999" }} className="hover:opacity-70 text-xl">
                ✕
              </button>
            </div>

            <p className="mb-6" style={{ color: "#666666" }}>
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
                    style={{ backgroundColor: "#333333" }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#333333" }}
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

const LawtonViewPageMedicalEnhanced = () => {
  const { pacienteId } = useParams()
  const navigate = useNavigate()
  const [token, setToken] = useState("")
  const [historial, setHistorial] = useState([])
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null)
  const [pagina, setPagina] = useState(0)
  const [nombrePaciente, setNombrePaciente] = useState("")
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState("")

  // Estados para el sistema de ayuda
  const [showHelp, setShowHelp] = useState(false)
  const [helpStep, setHelpStep] = useState(0)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  const porPagina = 3

  useEffect(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tkn = await user.getIdToken()
        setToken(tkn)
      } else {
        navigate("/login")
      }
    })
  }, [navigate])

  useEffect(() => {
    if (!token || !pacienteId) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const historialRes = await axios.get(`${API_GATEWAY}/api/formularios/lawton/historial/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHistorial(historialRes.data)
        setEvaluacionSeleccionada(historialRes.data[0])

        const pacienteRes = await axios.get(`${API_GATEWAY}/api/pacientes/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setNombrePaciente(`${pacienteRes.data.nombre} ${pacienteRes.data.apellido}`)

        setMensaje("✅ Evaluaciones cargadas correctamente")
      } catch (err) {
        console.error("❌ Error al obtener datos:", err)
        setMensaje("❌ No se encontró historial Lawton para este paciente")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, pacienteId])

  const generarPDF = async () => {
    try {
      setMensaje("📄 Generando PDF...")
      const input = document.getElementById("evaluacion-lawton")
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "pt", "a4")
      const width = pdf.internal.pageSize.getWidth()
      const height = (canvas.height * width) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, width, height)
      pdf.save(`Evaluacion_Lawton_${nombrePaciente}.pdf`)
      setMensaje("✅ PDF generado correctamente")
    } catch (error) {
      console.error("Error generando PDF:", error)
      setMensaje("❌ Error al generar PDF")
    }
  }

  const booleanToIcon = (val) => (val ? "✓" : "✗")
  const historialPaginado = historial.slice(pagina * porPagina, (pagina + 1) * porPagina)
  const totalPaginas = Math.ceil(historial.length / porPagina)

  const actividades = [
    { key: "usoTelefono", label: "Uso del teléfono", icon: "📞" },
    { key: "hacerCompras", label: "Hacer compras", icon: "🛒" },
    { key: "preparacionComida", label: "Preparación de comidas", icon: "🍳" },
    { key: "cuidadoCasa", label: "Cuidado de la casa", icon: "🏠" },
    { key: "lavadoRopa", label: "Lavado de ropa", icon: "👕" },
    { key: "usoTransporte", label: "Uso de transporte", icon: "🚌" },
    { key: "manejoMedicacion", label: "Manejo de medicación", icon: "💊" },
    { key: "manejoFinanzas", label: "Manejo de finanzas", icon: "💰" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
        <MenuLateralMedico />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-4"
              style={{
                borderColor: "#E5E5E5",
                borderTopColor: "#C7B8EA",
              }}
            ></div>
            <h2 className="text-2xl font-bold" style={{ color: "#333333" }}>
              Cargando evaluación...
            </h2>
            <p className="mt-2" style={{ color: "#666666" }}>
              Obteniendo datos de Lawton-Brody
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        {/* Header médico profesional */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-white border shadow-sm" style={{ borderColor: "#E5E5E5" }}>
                <span className="text-2xl" style={{ color: "#333333" }}>
                  📋
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#333333" }}>
                  Evaluación Lawton-Brody
                </h1>
                <p style={{ color: "#666666" }}>Actividades Instrumentales de la Vida Diaria</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E5E5E5", color: "#666666", backgroundColor: "#FFFFFF" }}
            >
              <span>←</span>
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Mensajes clínicos */}
        {mensaje && (
          <div className="mb-6">
            <div
              className="p-4 rounded-lg border-l-4 shadow-sm"
              style={{
                backgroundColor: mensaje.includes("❌") ? "#FEF2F2" : "#F0FDF4",
                borderLeftColor: mensaje.includes("❌") ? "#EF4444" : "#22C55E",
                color: mensaje.includes("❌") ? "#DC2626" : "#16A34A",
              }}
            >
              <p className="font-medium">{mensaje}</p>
            </div>
          </div>
        )}

        {/* Evaluación Principal - Diseño clínico */}
        <div className="max-w-4xl mx-auto mb-8">
          <div
            className="bg-white shadow-lg rounded-lg border overflow-hidden"
            style={{ borderColor: "#E5E5E5" }}
            id="evaluacion-lawton"
          >
            {/* Header clínico con toque sutil de marca */}
            <div className="bg-white border-b p-6" style={{ borderBottomColor: "#E5E5E5" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: "#333333" }}>
                    Evaluación Lawton-Brody
                  </h2>
                  <p className="text-lg mb-1" style={{ color: "#666666" }}>
                    Paciente: {nombrePaciente}
                  </p>
                  <p className="text-sm" style={{ color: "#999999" }}>
                    Fecha:{" "}
                    {evaluacionSeleccionada
                      ? new Date(evaluacionSeleccionada.fechaRegistro).toLocaleString("es-CO")
                      : "..."}
                  </p>
                </div>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg border-2"
                  style={{ borderColor: "#C7B8EA", color: "#C7B8EA" }}
                >
                  KALA
                </div>
              </div>
            </div>

            {/* Texto explicativo para el PDF */}
            <div className="p-6 border-b" style={{ borderBottomColor: "#E5E5E5", backgroundColor: "#FAFAFA" }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "#333333" }}>
                📋 Acerca de la Evaluación Lawton-Brody
              </h3>
              <div className="text-sm leading-relaxed space-y-2" style={{ color: "#666666" }}>
                <p>
                  <strong>Propósito:</strong> La escala de Lawton-Brody evalúa las Actividades Instrumentales de la Vida
                  Diaria (AIVD), que son actividades más complejas que las actividades básicas y requieren un mayor
                  nivel de funcionamiento cognitivo y físico.
                </p>
                <p>
                  <strong>Interpretación:</strong> Esta evaluación mide la capacidad del paciente para realizar 8
                  actividades instrumentales clave. Un resultado "Independiente" (✓) indica que el paciente puede
                  realizar la actividad sin ayuda, mientras que "Dependiente" (✗) sugiere necesidad de asistencia o
                  supervisión.
                </p>
                <p>
                  <strong>Uso clínico:</strong> Los resultados ayudan a determinar el nivel de independencia funcional
                  del paciente y planificar intervenciones apropiadas para mantener o mejorar su autonomía en el hogar y
                  la comunidad.
                </p>
              </div>
            </div>

            {/* Grid de actividades - Diseño clínico limpio */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#333333" }}>
                Resultados de la Evaluación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {actividades.map((actividad) => {
                  const isPositive = evaluacionSeleccionada?.[actividad.key]
                  return (
                    <div
                      key={actividad.key}
                      className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm"
                      style={{
                        borderColor: "#E5E5E5",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg" style={{ color: "#666666" }}>
                          {actividad.icon}
                        </span>
                        <span className="font-medium" style={{ color: "#333333" }}>
                          {actividad.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            backgroundColor: isPositive ? "#F0FDF4" : "#FEF2F2",
                            color: isPositive ? "#059669" : "#DC2626",
                          }}
                        >
                          {isPositive ? "Independiente" : "Dependiente"}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{
                            backgroundColor: isPositive ? "#22C55E" : "#EF4444",
                          }}
                        >
                          {booleanToIcon(isPositive)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Observaciones clínicas */}
              <div className="p-4 rounded-lg border" style={{ borderColor: "#E5E5E5", backgroundColor: "#FAFAFA" }}>
                <h3 className="font-semibold mb-2" style={{ color: "#333333" }}>
                  📝 Observaciones Clínicas
                </h3>
                <p className="text-sm" style={{ color: "#666666" }}>
                  {evaluacionSeleccionada?.observaciones || "Ninguna observación registrada"}
                </p>
              </div>

              {/* Recomendaciones clínicas */}
              <div
                className="mt-4 p-4 rounded-lg border"
                style={{ borderColor: "#E5E5E5", backgroundColor: "#F8F8F8" }}
              >
                <h3 className="font-semibold mb-2" style={{ color: "#333333" }}>
                  💡 Recomendaciones Generales
                </h3>
                <div className="text-sm space-y-1" style={{ color: "#666666" }}>
                  <p>• Revisar periódicamente las actividades marcadas como dependientes</p>
                  <p>• Considerar intervenciones de terapia ocupacional para mejorar la independencia</p>
                  <p>• Evaluar la necesidad de adaptaciones en el hogar o asistencia domiciliaria</p>
                  <p>• Programar seguimiento según la evolución del paciente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de descarga profesional */}
          <div className="text-center mt-6">
            <button
              onClick={generarPDF}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg mx-auto text-white hover:opacity-90"
              style={{ backgroundColor: "#333333" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
              </svg>
              <span>Descargar Reporte PDF</span>
            </button>
          </div>
        </div>

        {/* Historial clínico */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border p-6" style={{ borderColor: "#E5E5E5" }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-white border" style={{ borderColor: "#E5E5E5" }}>
                <span className="text-xl" style={{ color: "#333333" }}>
                  📈
                </span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#333333" }}>
                Historial de Evaluaciones
              </h2>
            </div>

            {historial.length === 0 ? (
              <div className="text-center py-12" style={{ color: "#999999" }}>
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-xl font-semibold mb-2">No hay evaluaciones</h3>
                <p>No se encontraron evaluaciones Lawton-Brody para este paciente</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {historialPaginado.map((ev, idx) => (
                    <div
                      key={idx + pagina * porPagina}
                      onClick={() => setEvaluacionSeleccionada(ev)}
                      className="cursor-pointer transition-all border rounded-lg p-4 hover:shadow-md"
                      style={{
                        backgroundColor: ev === evaluacionSeleccionada ? "#F8F8F8" : "#FFFFFF",
                        borderColor: ev === evaluacionSeleccionada ? "#C7B8EA" : "#E5E5E5",
                        borderWidth: ev === evaluacionSeleccionada ? "2px" : "1px",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold" style={{ color: "#333333" }}>
                            Evaluación #{historial.length - historial.indexOf(ev)}
                          </p>
                          <p className="text-sm" style={{ color: "#666666" }}>
                            {new Date(ev.fechaRegistro).toLocaleString("es-CO")}
                          </p>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span style={{ color: "#666666" }}>📞</span>
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                backgroundColor: ev.usoTelefono ? "#22C55E" : "#EF4444",
                              }}
                            >
                              {booleanToIcon(ev.usoTelefono)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span style={{ color: "#666666" }}>💰</span>
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                backgroundColor: ev.manejoFinanzas ? "#22C55E" : "#EF4444",
                              }}
                            >
                              {booleanToIcon(ev.manejoFinanzas)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación clínica */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                      onClick={() => setPagina((prev) => Math.max(prev - 1, 0))}
                      disabled={pagina === 0}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 border"
                      style={{
                        borderColor: "#E5E5E5",
                        backgroundColor: "#FFFFFF",
                        color: pagina === 0 ? "#999999" : "#333333",
                      }}
                    >
                      <span>←</span>
                      <span>Anterior</span>
                    </button>

                    <span className="text-sm px-4 py-2" style={{ color: "#666666" }}>
                      {pagina + 1} de {totalPaginas}
                    </span>

                    <button
                      onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas - 1))}
                      disabled={pagina === totalPaginas - 1}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 border"
                      style={{
                        borderColor: "#E5E5E5",
                        backgroundColor: "#FFFFFF",
                        color: pagina === totalPaginas - 1 ? "#999999" : "#333333",
                      }}
                    >
                      <span>Siguiente</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </>
            )}
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

      {/* Botón flotante de ayuda con colores y animaciones originales */}
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

          {/* Menú de ayuda con colores originales */}
          {showQuickHelp && (
            <div
              className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border p-6 w-72 animate-fadeInBlur"
              style={{ borderColor: "#E5E5E5" }}
            >
              {/* Header del menú */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: "#666666" }}>
                      Ayuda - Lawton
                    </h4>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Evaluación AIVD
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
                      Aprende a interpretar Lawton-Brody
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    generarPDF()
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#89CCC910", border: "1px solid #89CCC920" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC9" }}>
                    <span className="text-white text-sm">📄</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Generar PDF
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Descargar reporte profesional
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate("/formularios")
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#F8D44210", border: "1px solid #F8D44220" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#F8D442" }}>
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Ver Formularios
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Gestionar todas las evaluaciones
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer del menú */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
                <p className="text-xs text-center" style={{ color: "#999999" }}>
                  Evaluación de Actividades Instrumentales de la Vida Diaria
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LawtonViewPageMedicalEnhanced

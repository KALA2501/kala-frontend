"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import MenuLateralMedico from "./components/MenuLateralMedico"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Componente de ayuda simplificado
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
                      backgroundColor: index === currentStep ? "#666666" : "#E5E5E5",
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
                    style={{ backgroundColor: "#666666" }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#666666" }}
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

const LawtonViewPageImproved = () => {
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
                borderTopColor: "#666666",
              }}
            ></div>
            <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
              Cargando evaluación...
            </h2>
            <p className="mt-2" style={{ color: "#999999" }}>
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
        {/* Header simplificado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl shadow-md bg-white border" style={{ borderColor: "#E5E5E5" }}>
                <span className="text-2xl" style={{ color: "#666666" }}>
                  📋
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Evaluación Lawton-Brody
                </h1>
                <p style={{ color: "#999999" }}>Actividades Instrumentales de la Vida Diaria</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E5E5E5", color: "#666666" }}
            >
              <span>←</span>
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Mensajes simplificados */}
        {mensaje && (
          <div className="mb-6">
            <div
              className="p-4 rounded-xl border-l-4 shadow-sm"
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

        {/* Evaluación Principal - Diseño limpio */}
        <div className="max-w-4xl mx-auto mb-8">
          <div
            className="bg-white shadow-lg rounded-xl border overflow-hidden"
            style={{ borderColor: "#E5E5E5" }}
            id="evaluacion-lawton"
          >
            {/* Header minimalista */}
            <div className="bg-white border-b p-6" style={{ borderBottomColor: "#E5E5E5" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
                    Evaluación Lawton-Brody
                  </h2>
                  <p className="text-lg" style={{ color: "#999999" }}>
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
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-2"
                  style={{ borderColor: "#E5E5E5", color: "#666666" }}
                >
                  KALA
                </div>
              </div>
            </div>

            {/* Grid de actividades - Diseño más limpio */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {actividades.map((actividad) => {
                  const isPositive = evaluacionSeleccionada?.[actividad.key]
                  return (
                    <div
                      key={actividad.key}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{ borderColor: "#E5E5E5" }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{actividad.icon}</span>
                        <span className="font-medium" style={{ color: "#666666" }}>
                          {actividad.label}
                        </span>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                        style={{
                          backgroundColor: isPositive ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {booleanToIcon(isPositive)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Observaciones */}
              <div className="p-4 rounded-lg border" style={{ borderColor: "#E5E5E5" }}>
                <h3 className="font-semibold mb-2" style={{ color: "#666666" }}>
                  📝 Observaciones
                </h3>
                <p className="text-sm" style={{ color: "#999999" }}>
                  {evaluacionSeleccionada?.observaciones || "Ninguna observación registrada"}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de descarga simplificado */}
          <div className="text-center mt-6">
            <button
              onClick={generarPDF}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg mx-auto text-white"
              style={{ backgroundColor: "#666666" }}
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
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Historial simplificado */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: "#E5E5E5" }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg border" style={{ borderColor: "#E5E5E5" }}>
                <span className="text-xl" style={{ color: "#666666" }}>
                  📈
                </span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
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
                      className={`cursor-pointer transition-all border rounded-lg p-4 hover:shadow-md ${
                        ev === evaluacionSeleccionada ? "border-2" : "border"
                      }`}
                      style={{
                        backgroundColor: ev === evaluacionSeleccionada ? "#F8F8F8" : "#FFFFFF",
                        borderColor: ev === evaluacionSeleccionada ? "#666666" : "#E5E5E5",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold" style={{ color: "#666666" }}>
                            Evaluación #{historial.length - historial.indexOf(ev)}
                          </p>
                          <p className="text-sm" style={{ color: "#999999" }}>
                            {new Date(ev.fechaRegistro).toLocaleString("es-CO")}
                          </p>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span>📞</span>
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: ev.usoTelefono ? "#22C55E" : "#EF4444" }}
                            >
                              {booleanToIcon(ev.usoTelefono)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💰</span>
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: ev.manejoFinanzas ? "#22C55E" : "#EF4444" }}
                            >
                              {booleanToIcon(ev.manejoFinanzas)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación simplificada */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                      onClick={() => setPagina((prev) => Math.max(prev - 1, 0))}
                      disabled={pagina === 0}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 border"
                      style={{
                        borderColor: "#E5E5E5",
                        backgroundColor: pagina === 0 ? "#F8F8F8" : "#FFFFFF",
                        color: "#666666",
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
                        backgroundColor: pagina === totalPaginas - 1 ? "#F8F8F8" : "#FFFFFF",
                        color: "#666666",
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

      {/* Botón de ayuda simplificado */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative">
          <button
            onClick={() => setShowQuickHelp(!showQuickHelp)}
            className="group relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 bg-white"
            style={{ borderColor: "#E5E5E5", color: "#666666" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Menú de ayuda simplificado */}
          {showQuickHelp && (
            <div
              className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border p-4 w-64"
              style={{ borderColor: "#E5E5E5" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold" style={{ color: "#666666" }}>
                  Ayuda - Lawton
                </h4>
                <button onClick={() => setShowQuickHelp(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowHelp(true)
                    setHelpStep(0)
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg transition-colors hover:bg-gray-50 border"
                  style={{ borderColor: "#E5E5E5" }}
                >
                  <span>📖</span>
                  <span className="text-sm" style={{ color: "#666666" }}>
                    Tutorial completo
                  </span>
                </button>

                <button
                  onClick={() => {
                    generarPDF()
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg transition-colors hover:bg-gray-50 border"
                  style={{ borderColor: "#E5E5E5" }}
                >
                  <span>📄</span>
                  <span className="text-sm" style={{ color: "#666666" }}>
                    Generar PDF
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LawtonViewPageImproved

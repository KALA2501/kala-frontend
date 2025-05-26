"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import MenuLateralMedico from "./components/MenuLateralMedico"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts"

const API_METRICAS = "http://localhost:8080/api/metricas"

// Componente de ayuda para desempeño individual
const HelpSystem = ({ isOpen, onClose, currentStep, setCurrentStep, totalSteps }) => {
  const helpSteps = [
    {
      title: "👥 Análisis Individual",
      content:
        "Esta página te permite analizar el desempeño detallado de cada paciente en las actividades cognitivas, proporcionando insights específicos para el seguimiento personalizado.",
    },
    {
      title: "📊 Gráficos de Evolución",
      content:
        "Los gráficos de líneas muestran la progresión temporal del paciente, permitiendo identificar tendencias de mejora o deterioro en diferentes aspectos cognitivos.",
    },
    {
      title: "📈 Métricas de Rendimiento",
      content:
        "Analiza errores, tiempos de respuesta y precisión para identificar áreas de fortaleza y oportunidades de mejora en el tratamiento.",
    },
    {
      title: "🎯 Interpretación Clínica",
      content:
        "Usa estos datos para ajustar planes de tratamiento, establecer objetivos específicos y documentar el progreso del paciente.",
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
              <button onClick={onClose} style={{ color: "#999999" }} className="hover:opacity-70 text-xl">
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

const normalizeMetricas = (data) => {
  const parseFecha = (f) => new Date(f).toISOString().split("T")[0]
  return {
    historialTiempo: (data.historialTiempo || []).map((d) => ({
      fecha: parseFecha(d.fecha),
      tiempo_promedio: Number.parseFloat(d.tiempo_promedio),
    })),
    erroresPorSesion: (data.erroresPorSesion || []).map((d) => ({
      fecha: parseFecha(d.fecha),
      errores_totales: Number.parseInt(d.errores_totales),
    })),
    erroresPorCubierto: (data.erroresPorCubierto || []).map((d) => ({
      paciente_id: d.paciente_id,
      cuchillo: Number.parseInt(d.cuchillo),
      cuchara: Number.parseInt(d.cuchara),
      tenedor: Number.parseInt(d.tenedor),
    })),
    erroresPorPlato: (data.erroresPorPlato || []).map((d) => ({
      paciente_id: d.paciente_id,
      pizza: Number.parseInt(d.pizza),
      sopa: Number.parseInt(d.sopa),
      ramen: Number.parseInt(d.ramen),
    })),
  }
}

const DesempenoIndividualPageEnhanced = () => {
  const { actividad } = useParams()
  const navigate = useNavigate()
  const [token, setToken] = useState("")
  const [medicoId, setMedicoId] = useState("")
  const [pacientes, setPacientes] = useState([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [metricas, setMetricas] = useState({})
  const [loading, setLoading] = useState(true)

  // Estados para el sistema de ayuda
  const [showHelp, setShowHelp] = useState(false)
  const [helpStep, setHelpStep] = useState(0)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  // Información de actividades
  const activityInfo = {
    cajero: {
      title: "Mi Tienda",
      icon: "🏪",
      description: "Análisis detallado de actividades de cajero",
      color: "#C7B8EA",
    },
    mercado: {
      title: "Ir de Compras",
      icon: "🛒",
      description: "Seguimiento individual de actividades de compras",
      color: "#89CCC9",
    },
    cubiertos: {
      title: "Cubiertos",
      icon: "🍽️",
      description: "Evaluación personalizada de coordinación",
      color: "#F8D442",
    },
  }

  // Obtener token y medicoId desde Firebase y backend
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tkn = await user.getIdToken()
        setToken(tkn)
        try {
          const res = await axios.get(`http://localhost:8080/api/medicos/buscar-por-correo?correo=${user.email}`, {
            headers: { Authorization: `Bearer ${tkn}` },
          })
          setMedicoId(res.data.pkId)
          setLoading(false)
        } catch (err) {
          console.error("❌ Error obteniendo médico:", err)
          setLoading(false)
        }
      } else {
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // Cargar lista de pacientes vinculados al médico
  useEffect(() => {
    if (!token || !medicoId) return
    const fetchPacientes = async () => {
      try {
        const res = await axios.get(`${API_METRICAS}/pacientes-vinculados/${medicoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPacientes(res.data)
        if (res.data.length > 0) setPacienteSeleccionado(res.data[0].paciente_id)
      } catch (error) {
        console.error("Error cargando pacientes:", error)
      }
    }
    fetchPacientes()
  }, [token, medicoId])

  // Cargar métricas del paciente seleccionado
  useEffect(() => {
    if (!pacienteSeleccionado || !token) return
    const fetchMetricas = async () => {
      try {
        const endpoint =
          actividad === "cajero"
            ? `/paciente/${pacienteSeleccionado}/detalles`
            : actividad === "mercado"
              ? `/paciente/${pacienteSeleccionado}/mercado-detalles`
              : `/paciente/${pacienteSeleccionado}/cubiertos-detalles`

        const res = await axios.get(`${API_METRICAS}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (actividad === "cubiertos") {
          setMetricas(normalizeMetricas(res.data))
        } else {
          setMetricas(res.data)
        }
      } catch (error) {
        console.error("Error cargando métricas individuales:", error)
      }
    }
    fetchMetricas()
  }, [pacienteSeleccionado, actividad, token])

  const currentActivity = activityInfo[actividad] || activityInfo.cajero
  const pacienteActual = pacientes.find((p) => p.paciente_id === pacienteSeleccionado)

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
            <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
              Cargando datos del paciente...
            </h2>
            <p className="mt-2" style={{ color: "#999999" }}>
              Analizando métricas individuales
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <MenuLateralMedico />
      <div className="flex-1 p-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: currentActivity.color }}>
                <span className="text-white text-2xl">{currentActivity.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Desempeño Individual - {currentActivity.title}
                </h1>
                <p style={{ color: "#999999" }}>{currentActivity.description}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/metrics/${actividad}`)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E5E5E5", color: "#666666", backgroundColor: "#FFFFFF" }}
            >
              <span>←</span>
              <span>Volver a Métricas</span>
            </button>
          </div>
        </div>

        {/* Selector de paciente mejorado */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: "#E5E5E5" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC920" }}>
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#666666" }}>
                    Selección de Paciente
                  </h2>
                  <p style={{ color: "#999999" }}>Elige el paciente para analizar su desempeño</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={pacienteSeleccionado || ""}
                  onChange={(e) => setPacienteSeleccionado(e.target.value)}
                  className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 min-w-64"
                  style={{
                    borderColor: "#E5E5E5",
                    color: "#666666",
                  }}
                >
                  {pacientes.map((p) => (
                    <option key={p.paciente_id} value={p.paciente_id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {pacienteActual && (
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: "#666666" }}>
                      Paciente Actual
                    </p>
                    <p className="text-lg font-bold" style={{ color: currentActivity.color }}>
                      {pacienteActual.nombre}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido específico por actividad */}
        {actividad === "cajero" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineMetricChart
                title="Evolución del Tiempo"
                subtitle="Identificación de Dinero"
                data={metricas.evolucionTiempo || []}
                xKey="denominacion"
                yKey="tiempo"
                color="#C7B8EA"
                icon="⏱️"
                unit="seg"
              />
              <BarMetricChart
                title="Errores por Denominación"
                subtitle="Análisis de dificultades específicas"
                data={metricas.erroresDenominacion || []}
                xKey="denominacion"
                yKey="errores"
                color="#F8D442"
                icon="⚠️"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineMetricChart
                title="Historial de Actividades"
                subtitle="Progresión temporal"
                data={metricas.actividadesHistorial || []}
                xKey="fecha"
                yKey="cantidad"
                color="#89CCC9"
                icon="📈"
              />
              <BarMetricChart
                title="Precisión al Devolver Cambio"
                subtitle="Exactitud en cálculos"
                data={metricas.precisionCambio || []}
                xKey="monto"
                yKey="correcto"
                color="#FFEEEDD"
                icon="💰"
              />
            </div>
          </div>
        )}

        {actividad === "mercado" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineMetricChart
                title="Historial de Actividades"
                subtitle="Frecuencia de uso"
                data={metricas.historialActividades || []}
                xKey="fecha"
                yKey="cantidad"
                color="#89CCC9"
                icon="📊"
              />
              <LineMetricChart
                title="Evolución del Tiempo Total"
                subtitle="Duración de sesiones"
                data={metricas.evolucionTiempo || []}
                xKey="fecha"
                yKey="duracion"
                color="#C7B8EA"
                icon="⏱️"
                unit="min"
              />
            </div>

            <StackedBarChart
              title="Precisión en Selección de Ítems"
              subtitle="Comparación de aciertos vs errores"
              data={metricas.precisionPorSesion || []}
              xKey="fecha"
              bars={[
                { key: "correctos", color: "#89CCC9", name: "Correctos" },
                { key: "incorrectos", color: "#F8D442", name: "Incorrectos" },
              ]}
              icon="🎯"
            />
          </div>
        )}

        {actividad === "cubiertos" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AreaMetricChart
                title="Evolución del Tiempo"
                subtitle="Progreso en coordinación"
                data={metricas.historialTiempo || []}
                xKey="fecha"
                yKey="tiempo_promedio"
                color="#C7B8EA"
                icon="⏱️"
                unit="seg"
              />
              <LineMetricChart
                title="Errores Totales por Día"
                subtitle="Tendencia de errores"
                data={metricas.erroresPorSesion || []}
                xKey="fecha"
                yKey="errores_totales"
                color="#F8D442"
                icon="📉"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StackedBarChart
                title="Errores por Cubierto"
                subtitle="Análisis por tipo de utensilio"
                data={metricas.erroresPorCubierto ? [metricas.erroresPorCubierto[0]] : []}
                xKey="paciente_id"
                bars={[
                  { key: "cuchillo", color: "#C7B8EA", name: "Cuchillo" },
                  { key: "cuchara", color: "#89CCC9", name: "Cuchara" },
                  { key: "tenedor", color: "#F8D442", name: "Tenedor" },
                ]}
                icon="🍴"
              />
              <StackedBarChart
                title="Errores por Plato"
                subtitle="Dificultad según tipo de comida"
                data={metricas.erroresPorPlato ? [metricas.erroresPorPlato[0]] : []}
                xKey="paciente_id"
                bars={[
                  { key: "pizza", color: "#FFEEEDD", name: "Pizza" },
                  { key: "sopa", color: "#E5E5E5", name: "Sopa" },
                  { key: "ramen", color: "#C4C4C4", name: "Ramen" },
                ]}
                icon="🍽️"
              />
            </div>
          </div>
        )}

        {actividad !== "cajero" && actividad !== "mercado" && actividad !== "cubiertos" && (
          <div className="bg-white rounded-xl shadow-lg border p-12 text-center" style={{ borderColor: "#E5E5E5" }}>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "#F8D44220" }}>
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "#666666" }}>
              Actividad No Disponible
            </h3>
            <p style={{ color: "#999999" }}>Aún no hay métricas individuales disponibles para esta actividad.</p>
          </div>
        )}
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
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: "#C7B8EA" }}
            ></div>
          </button>

          {!showQuickHelp && (
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                ¿Necesitas ayuda?
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}

          {showQuickHelp && (
            <div
              className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border p-6 w-72"
              style={{ borderColor: "#E5E5E5" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: "#666666" }}>
                      Ayuda - Individual
                    </h4>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Análisis Personalizado
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
                      Aprende a interpretar datos
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate(`/metrics/${actividad}`)
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#89CCC910", border: "1px solid #89CCC920" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC9" }}>
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Métricas Generales
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Ver resumen de todos los pacientes
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para gráficos de líneas
const LineMetricChart = ({ title, subtitle, data, xKey, yKey, color, icon, unit = "" }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "#666666" }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#999999" }}>
          {subtitle}
        </p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis dataKey={xKey} tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <YAxis tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value) => [`${value}${unit}`, title]}
        />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{ fill: color, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

// Componente para gráficos de área
const AreaMetricChart = ({ title, subtitle, data, xKey, yKey, color, icon, unit = "" }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "#666666" }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#999999" }}>
          {subtitle}
        </p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis dataKey={xKey} tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <YAxis tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value) => [`${value}${unit}`, title]}
        />
        <Area type="monotone" dataKey={yKey} stroke={color} fill={`${color}40`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

// Componente para gráficos de barras
const BarMetricChart = ({ title, subtitle, data, xKey, yKey, color, icon }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "#666666" }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#999999" }}>
          {subtitle}
        </p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis dataKey={xKey} tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <YAxis tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

// Componente para gráficos de barras apiladas
const StackedBarChart = ({ title, subtitle, data, xKey, bars, icon }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "#666666" }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#999999" }}>
          {subtitle}
        </p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis dataKey={xKey} tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <YAxis tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            stackId="a"
            fill={bar.color}
            name={bar.name}
            radius={index === bars.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default DesempenoIndividualPageEnhanced

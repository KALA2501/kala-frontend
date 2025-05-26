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
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts"

const API_METRICAS = "http://localhost:8080/api/metricas"

// Componente de ayuda para métricas
const HelpSystem = ({ isOpen, onClose, currentStep, setCurrentStep, totalSteps }) => {
  const helpSteps = [
    {
      title: "📊 Dashboard de Métricas",
      content:
        "Este panel muestra el análisis detallado del rendimiento cognitivo de tus pacientes en diferentes actividades terapéuticas.",
    },
    {
      title: "🎯 Actividades Disponibles",
      content:
        "Puedes analizar tres tipos de actividades: Mi Tienda (cajero), Ir de Compras (mercado) y Cubiertos. Cada una evalúa diferentes aspectos cognitivos.",
    },
    {
      title: "📈 Interpretación de Gráficos",
      content:
        "Los gráficos muestran tendencias, comparaciones y correlaciones. Usa esta información para ajustar los planes de tratamiento.",
    },
    {
      title: "👥 Desempeño Individual",
      content: "Accede al análisis detallado de cada paciente para un seguimiento personalizado y específico.",
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

const MetricsPage = () => {
  const { actividad } = useParams() // cajero, mercado o cubiertos
  const navigate = useNavigate()
  const [medicoId, setMedicoId] = useState("")
  const [loading, setLoading] = useState(true)

  // Estados para el sistema de ayuda
  const [showHelp, setShowHelp] = useState(false)
  const [helpStep, setHelpStep] = useState(0)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  // Cajero
  const [conteoActividades, setConteoActividades] = useState([])
  const [tiempoPromedio, setTiempoPromedio] = useState([])
  const [erroresPromedio, setErroresPromedio] = useState([])
  const [tiempoVsErrores, setTiempoVsErrores] = useState([])
  const [erroresDenominacion, setErroresDenominacion] = useState([])
  const [actividadesErrores, setActividadesErrores] = useState([])

  // Mercado
  const [duracionPromedio, setDuracionPromedio] = useState([])
  const [consultasLista, setConsultasLista] = useState([])
  const [precisionItems, setPrecisionItems] = useState([])
  const [erroresCantidad, setErroresCantidad] = useState([])
  const [tiempoLista, setTiempoLista] = useState([])

  // Cubiertos
  const [erroresCubiertos, setErroresCubiertos] = useState([])
  const [erroresPlato, setErroresPlato] = useState([])
  const [tiempoCubiertos, setTiempoCubiertos] = useState([])

  const colores = [
    "#C7B8EA",
    "#89CCC9",
    "#F8D442",
    "#FFEEEDD",
    "#E5E5E5",
    "#666666",
    "#999999",
    "#C4C4C4",
    "#A0A0A0",
    "#D0D0D0",
  ]

  // Mapeo de actividades para mostrar nombres más amigables
  const activityInfo = {
    cajero: {
      title: "Mi Tienda",
      icon: "🏪",
      description: "Análisis cognitivo de actividades de cajero",
      color: "#C7B8EA",
    },
    mercado: {
      title: "Ir de Compras",
      icon: "🛒",
      description: "Métricas de actividades de compras",
      color: "#89CCC9",
    },
    cubiertos: {
      title: "Cubiertos",
      icon: "🍽️",
      description: "Evaluación de coordinación y selección",
      color: "#F8D442",
    },
  }

  // 1. OBTENER ID DE MEDICO DESDE LOGIN
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        const email = user.email
        try {
          const res = await axios.get(`http://localhost:8080/api/medicos/buscar-por-correo?correo=${email}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setMedicoId(res.data.pkId)
          setLoading(false)
        } catch (err) {
          console.error("❌ Error al obtener el ID del médico:", err)
          setLoading(false)
        }
      } else {
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // 2. CARGAR MÉTRICAS DEL MÉDICO
  useEffect(() => {
    if (!medicoId) return
    const fetchMetrics = async () => {
      try {
        let endpoints = []

        if (actividad === "cajero") {
          endpoints = [
            { key: "conteoActividades", url: `/conteo-actividades/${medicoId}` },
            { key: "tiempoPromedio", url: `/tiempo-promedio/${medicoId}` },
            { key: "erroresPromedio", url: `/errores-promedio/${medicoId}` },
            { key: "tiempoVsErrores", url: `/tiempo-vs-errores/${medicoId}` },
            { key: "erroresDenominacion", url: `/errores-por-denominacion/${medicoId}` },
            { key: "actividadesErrores", url: `/actividades-vs-errores/${medicoId}` },
          ]
        } else if (actividad === "mercado") {
          endpoints = [
            { key: "duracionPromedio", url: `/mercado/duracion-promedio/${medicoId}` },
            { key: "consultasLista", url: `/mercado/consultas-lista/${medicoId}` },
            { key: "precisionItems", url: `/mercado/precision-items/${medicoId}` },
            { key: "erroresCantidad", url: `/mercado/errores-cantidad/${medicoId}` },
            { key: "tiempoLista", url: `/mercado/tiempo-lista/${medicoId}` },
          ]
        } else if (actividad === "cubiertos") {
          endpoints = [{ key: "erroresCubiertos", url: `/cubiertos/general/${medicoId}` }]
        }

        for (const ep of endpoints) {
          const res = await axios.get(`${API_METRICAS}${ep.url}`)
          switch (ep.key) {
            case "conteoActividades":
              setConteoActividades(res.data)
              break
            case "tiempoPromedio":
              setTiempoPromedio(res.data)
              break
            case "erroresPromedio":
              setErroresPromedio(res.data)
              break
            case "tiempoVsErrores":
              setTiempoVsErrores(res.data)
              break
            case "erroresDenominacion":
              setErroresDenominacion(res.data)
              break
            case "actividadesErrores":
              setActividadesErrores(res.data)
              break
            case "duracionPromedio":
              setDuracionPromedio(res.data)
              break
            case "consultasLista":
              setConsultasLista(res.data)
              break
            case "precisionItems":
              setPrecisionItems(res.data)
              break
            case "erroresCantidad":
              setErroresCantidad(res.data)
              break
            case "tiempoLista":
              setTiempoLista(res.data)
              break
            case "erroresCubiertos":
              setErroresCubiertos(res.data.erroresPorCubierto || [])
              setErroresPlato(res.data.erroresPorPlato || [])
              setTiempoCubiertos(res.data.tiempoPromedio || [])
              break
            default:
              break
          }
        }
      } catch (err) {
        console.error(`❌ Error al cargar métricas ${actividad}:`, err)
      }
    }

    fetchMetrics()
  }, [actividad, medicoId])

  const agruparErroresPorDenominacion = () => {
    const agrupado = {}
    erroresDenominacion.forEach((item) => {
      const denom = item.denominacion
      const nombre = item.nombre_paciente || item.paciente_id
      if (!agrupado[denom]) agrupado[denom] = { denominacion: denom }
      agrupado[denom][nombre] = item.promedio_errores
    })
    return Object.values(agrupado)
  }

  const pacientesUnicos = [...new Set(erroresDenominacion.map((e) => e.nombre_paciente || e.paciente_id))]

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
              Cargando métricas...
            </h2>
            <p className="mt-2" style={{ color: "#999999" }}>
              Analizando datos cognitivos
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentActivity = activityInfo[actividad] || activityInfo.cajero

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
                  Métricas Cognitivas - {currentActivity.title}
                </h1>
                <p style={{ color: "#999999" }}>{currentActivity.description}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/metrics/${actividad}/desempeno-individual`)}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white"
              style={{ backgroundColor: currentActivity.color }}
            >
              <span>👥</span>
              <span>Desempeño Individual</span>
            </button>
          </div>
        </div>

        {/* Navegación de actividades */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {Object.entries(activityInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => navigate(`/metrics/${key}`)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  actividad === key ? "shadow-md" : "hover:shadow-sm"
                }`}
                style={{
                  backgroundColor: actividad === key ? info.color : "#FFFFFF",
                  color: actividad === key ? "#FFFFFF" : "#666666",
                  border: `1px solid ${actividad === key ? info.color : "#E5E5E5"}`,
                }}
              >
                <span>{info.icon}</span>
                <span className="font-medium">{info.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido específico por actividad */}
        {actividad === "cajero" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Actividades Realizadas por Paciente"
                data={conteoActividades}
                dataKey="total_actividades"
                fill="#C7B8EA"
                icon="📊"
              />
              <MetricChart
                title="Tiempo Promedio por Paciente"
                data={tiempoPromedio}
                dataKey="tiempo_promedio"
                fill="#89CCC9"
                icon="⏱️"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Errores Promedio por Paciente"
                data={erroresPromedio}
                dataKey="errores_promedio"
                fill="#F8D442"
                icon="⚠️"
              />
              <ScatterMetricChart
                title="Comparación Tiempo vs Errores"
                data={tiempoVsErrores}
                xKey="promedio_tiempo"
                yKey="promedio_errores"
                xLabel="Tiempo (seg)"
                yLabel="Errores"
                fill="#FFEEEDD"
                icon="📈"
              />
            </div>

            <StackedBarChart
              title="Errores por Denominación (por Paciente)"
              data={agruparErroresPorDenominacion()}
              pacientes={pacientesUnicos}
              colores={colores}
              icon="💰"
            />

            <MetricChart
              title="Actividades vs Errores Totales"
              data={actividadesErrores}
              dataKey="total_errores"
              fill="#E5E5E5"
              icon="🎯"
            />
          </div>
        )}

        {actividad === "mercado" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Duración Promedio de la Actividad"
                data={duracionPromedio}
                dataKey="duracion_promedio"
                fill="#89CCC9"
                icon="⏱️"
              />
              <MetricChart
                title="Consultas Promedio a la Lista"
                data={consultasLista}
                dataKey="promedio_consultas_lista"
                fill="#C7B8EA"
                icon="📋"
              />
            </div>

            <MetricChart
              title="Tiempo Promedio Mirando la Lista"
              data={tiempoLista}
              dataKey="tiempo_promedio_lista"
              fill="#F8D442"
              icon="👀"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Selecciones Correctas"
                data={precisionItems}
                dataKey="total_correctos"
                fill="#89CCC9"
                icon="✅"
              />
              <MetricChart
                title="Selecciones Incorrectas"
                data={precisionItems}
                dataKey="total_incorrectos"
                fill="#FFEEEDD"
                icon="❌"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Promedio Desviación en Cantidad"
                data={erroresCantidad}
                dataKey="promedio_desviacion"
                fill="#E5E5E5"
                icon="📏"
              />
              <MetricChart
                title="Cantidad Incorrecta Promedio"
                data={erroresCantidad}
                dataKey="cantidad_incorrecta_prom"
                fill="#C4C4C4"
                icon="🔢"
              />
            </div>
          </div>
        )}

        {actividad === "cubiertos" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricChart
                title="Errores con Cuchillo"
                data={erroresCubiertos}
                dataKey="cuchillo"
                fill="#C7B8EA"
                icon="🔪"
              />
              <MetricChart
                title="Errores con Cuchara"
                data={erroresCubiertos}
                dataKey="cuchara"
                fill="#89CCC9"
                icon="🥄"
              />
              <MetricChart
                title="Errores con Tenedor"
                data={erroresCubiertos}
                dataKey="tenedor"
                fill="#F8D442"
                icon="🍴"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricChart title="Errores con Pizza" data={erroresPlato} dataKey="pizza" fill="#FFEEEDD" icon="🍕" />
              <MetricChart title="Errores con Sopa" data={erroresPlato} dataKey="sopa" fill="#E5E5E5" icon="🍲" />
              <MetricChart title="Errores con Ramen" data={erroresPlato} dataKey="ramen" fill="#C4C4C4" icon="🍜" />
            </div>

            <MetricChart
              title="Tiempo Promedio por Paciente"
              data={tiempoCubiertos}
              dataKey="tiempo_promedio"
              fill="#666666"
              icon="⏱️"
            />
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
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: "#666666" }}>
                      Ayuda - Métricas
                    </h4>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Análisis Cognitivo
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
                      Aprende a interpretar métricas
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate(`/metrics/${actividad}/desempeno-individual`)
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
                      Análisis Individual
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Ver desempeño por paciente
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

// Componente mejorado para gráficos de barras
const MetricChart = ({ title, data, dataKey, fill, icon }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${fill}20` }}>
        <span className="text-xl">{icon}</span>
      </div>
      <h2 className="text-lg font-semibold" style={{ color: "#666666" }}>
        {title}
      </h2>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis dataKey="nombre" tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <YAxis tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

// Componente para gráficos de dispersión
const ScatterMetricChart = ({ title, data, xKey, yKey, xLabel, yLabel, fill, icon }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${fill}20` }}>
        <span className="text-xl">{icon}</span>
      </div>
      <h2 className="text-lg font-semibold" style={{ color: "#666666" }}>
        {title}
      </h2>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis
          type="number"
          dataKey={xKey}
          name={xLabel}
          tick={{ fill: "#999999", fontSize: 12 }}
          axisLine={{ stroke: "#E5E5E5" }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={yLabel}
          tick={{ fill: "#999999", fontSize: 12 }}
          axisLine={{ stroke: "#E5E5E5" }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Scatter data={data} fill={fill} />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
)

// Componente para gráficos de barras apiladas
const StackedBarChart = ({ title, data, pacientes, colores, icon }) => (
  <div
    className="bg-white rounded-xl shadow-lg border p-6 transition-all duration-200 hover:shadow-xl"
    style={{ borderColor: "#E5E5E5" }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
        <span className="text-xl">{icon}</span>
      </div>
      <h2 className="text-lg font-semibold" style={{ color: "#666666" }}>
        {title}
      </h2>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis dataKey="denominacion" tick={{ fill: "#999999", fontSize: 12 }} axisLine={{ stroke: "#E5E5E5" }} />
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
        {pacientes.map((paciente, index) => (
          <Bar
            key={paciente}
            dataKey={paciente}
            stackId="a"
            fill={colores[index % colores.length]}
            radius={index === pacientes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default MetricsPage

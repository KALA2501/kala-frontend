"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"

import CentroMedicoNavbar from "../components/CentroMedicoNavbar"
import CentroMedicoFooter from "../components/CentroMedicoFooter"
import CentroMedicoTableMedicos from "../components/CentroMedicoTableMedicos"
import CentroMedicoTablePacientes from "../components/CentroMedicoTablePacientes"
import CentroMedicoFormMedico from "../components/CentroMedicoFormMedico"
import { subirImagen } from "../../../services/firebase"

const API_GATEWAY = process.env.REACT_APP_GATEWAY

const CentroMedicoPanelPage = () => {
  const [medicos, setMedicos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [activeTab, setActiveTab] = useState("medicos")
  const [centro, setCentro] = useState(null)
  const [logo, setLogo] = useState("")
  const [logoSubido, setLogoSubido] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <CentroMedicoNavbar nombreCentro={centro?.nombre || "Centro Médico"} onLogout={handleLogout} />

      {/* Header del panel */}
      <div className="bg-white shadow-lg" style={{ borderBottomColor: "#E5E5E5", borderBottomWidth: "1px" }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: "#89CCC9" }}>
                <span className="text-white text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Panel del Centro Médico
                </h1>
                <p style={{ color: "#999999" }}>{centro?.nombre || "Gestiona médicos y pacientes de tu centro"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        {/* Botón para agregar médico */}
        <div className="flex justify-end mb-6">
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
                onClick={() => setActiveTab("medicos")}
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
                onClick={() => setActiveTab("pacientes")}
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
            <div className="bg-white rounded-xl shadow-lg border animate-fadeInBlur" style={{ borderColor: "#E5E5E5" }}>
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
            <div className="bg-white rounded-xl shadow-lg border animate-fadeInBlur" style={{ borderColor: "#E5E5E5" }}>
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
  )
}

export default CentroMedicoPanelPage

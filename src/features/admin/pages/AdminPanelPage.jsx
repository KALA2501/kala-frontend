"use client"

import { useEffect, useState, useCallback } from "react"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import AdminNavbar from "../components/AdminNavbar"
import AdminFooter from "../components/AdminFooter"
import MenuLateral from "../components/MenuLateral "

const API_GATEWAY = process.env.REACT_APP_GATEWAY

const AdminPanelPage = () => {
  const [usuarios, setUsuarios] = useState({
    centro_medico: [],
    medico: [],
    paciente: [],
  })
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [activeTab, setActiveTab] = useState("usuarios")
  const [adminEmail, setAdminEmail] = useState("")
  const [rolSeleccionado, setRolSeleccionado] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const navigate = useNavigate()

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([cargarUsuarios(), cargarSolicitudes()])
    } finally {
      setLoading(false)
    }
  }, [])

  const cargarUsuarios = async () => {
    try {
      const token = await getAuth().currentUser.getIdToken()
      const res = await axios.get(`${API_GATEWAY}/api/admin/usuarios-firebase`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const raw = res.data.usuariosPorRol

      setUsuarios({
        centro_medico: raw?.["centro_medico"] ?? [],
        medico: raw?.["medico"] ?? [],
        paciente: raw?.["paciente"] ?? [],
      })
    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al cargar usuarios")
    }
  }

  const cargarSolicitudes = async () => {
    try {
      const token = await getAuth().currentUser.getIdToken()
      const res = await axios.get(`${API_GATEWAY}/api/solicitudes-centro-medico`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSolicitudes(res.data)
    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al cargar solicitudes")
    }
  }

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== "admin@kala.com") {
        navigate("/login")
      } else {
        setAdminEmail(user.email)
        cargarDatos()
      }
    })
    return () => unsubscribe()
  }, [navigate, cargarDatos])

  const cerrarSesion = async () => {
    try {
      await signOut(getAuth())
      navigate("/")
    } catch (error) {
      setMensaje("❌ Error al cerrar sesión")
    }
  }

  const eliminarUsuario = async (uid) => {
    try {
      const token = await getAuth().currentUser.getIdToken()
      await axios.delete(`${API_GATEWAY}/api/admin/usuarios-firebase/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMensaje("✅ Usuario eliminado exitosamente")
      await cargarUsuarios()
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al eliminar usuario")
    }
  }

  const procesarSolicitud = async (id, rol) => {
    if (!rol) {
      setMensaje("❌ Selecciona un rol para procesar")
      return
    }
    try {
      const token = await getAuth().currentUser.getIdToken()
      let rolFormateado = ""
      switch (rol) {
        case "CENTRO_MEDICO":
          rolFormateado = "centro_medico"
          break
        case "PACIENTE":
          rolFormateado = "paciente"
          break
        case "MEDICO":
          rolFormateado = "medico"
          break
        case "ADMINISTRADOR":
          rolFormateado = "admin"
          break
        default:
          rolFormateado = rol.toLowerCase()
          break
      }

      await axios.put(`${API_GATEWAY}/api/solicitudes-centro-medico/${id}/procesar?rol=${rolFormateado}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setMensaje("✅ Solicitud procesada exitosamente")
      await cargarDatos()
    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al procesar solicitud")
    }
  }

  const revertirSolicitud = async (id) => {
    try {
      const token = await getAuth().currentUser.getIdToken()
      await axios.put(`${API_GATEWAY}/api/solicitudes-centro-medico/${id}/revertir`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMensaje("✅ Solicitud revertida exitosamente")
      await cargarDatos()
    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al revertir solicitud")
    }
  }

  const eliminarSolicitud = async (id) => {
    if (!window.confirm("¿Eliminar esta solicitud definitivamente?")) return
    try {
      const token = await getAuth().currentUser.getIdToken()
      await axios.delete(`${API_GATEWAY}/api/solicitudes-centro-medico/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMensaje("✅ Solicitud eliminada exitosamente")
      await cargarDatos()
    } catch (error) {
      console.error(error)
      setMensaje("❌ Error al eliminar solicitud")
    }
  }

  const filteredUsuarios = Object.entries(usuarios).reduce((acc, [rol, listaUsuarios]) => {
    if (filterRole === "all" || filterRole === rol) {
      const filtered = listaUsuarios.filter((usuario) => usuario.email.toLowerCase().includes(searchTerm.toLowerCase()))
      if (filtered.length > 0) {
        acc[rol] = filtered
      }
    }
    return acc
  }, {})

  const filteredSolicitudes = solicitudes.filter(
    (solicitud) =>
      solicitud.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalUsuarios = Object.values(usuarios).reduce((sum, lista) => sum + lista.length, 0)

  const getRoleIcon = (rol) => {
    const icons = {
      centro_medico: "🏥",
      medico: "👨‍⚕️",
      paciente: "👤",
      admin: "🛡️",
    }
    return icons[rol] || "👤"
  }

  const getRoleBadgeStyle = (rol) => {
    const styles = {
      centro_medico: { backgroundColor: "#89CCC920", color: "#89CCC9", borderColor: "#89CCC940" },
      medico: { backgroundColor: "#C7B8EA20", color: "#C7B8EA", borderColor: "#C7B8EA40" },
      paciente: { backgroundColor: "#F8D44220", color: "#F8D442", borderColor: "#F8D44240" },
      admin: { backgroundColor: "#FEAF0020", color: "#FEAF00", borderColor: "#FEAF0040" },
    }
    return styles[rol] || { backgroundColor: "#E5E5E520", color: "#666666", borderColor: "#E5E5E540" }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-4"
            style={{
              borderColor: "#E5E5E5",
              borderTopColor: "#C7B8EA",
            }}
          ></div>
          <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
            Cargando panel de administración...
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
      <MenuLateral onLogout={cerrarSesion} />

      <div className="flex-1 flex flex-col">
        <AdminNavbar adminEmail={adminEmail} onLogout={cerrarSesion} />

        {/* Header mejorado */}
        <div className="bg-white shadow-lg" style={{ borderBottomColor: "#E5E5E5", borderBottomWidth: "1px" }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: "#C7B8EA" }}>
                  <span className="text-white text-2xl">🛡️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                    Panel de Administración
                  </h1>
                  <p style={{ color: "#999999" }}>Sistema de gestión médica KALA</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: "#C7B8EA20",
                    color: "#C7B8EA",
                  }}
                >
                  {adminEmail}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de alerta mejorados */}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border"
              style={{ borderColor: "#E5E5E5" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "#999999" }}>
                    Total Usuarios
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                    {totalUsuarios}
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
                    Centros Médicos
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                    {usuarios.centro_medico.length}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: "#89CCC920" }}>
                  <span className="text-2xl">🏥</span>
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
                    Médicos
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                    {usuarios.medico.length}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: "#F8D44220" }}>
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
                    Solicitudes
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#666666" }}>
                    {solicitudes.length}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: "#FEAF0020" }}>
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación de pestañas mejorada */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-2 border" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("usuarios")}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === "usuarios" ? "#C7B8EA" : "transparent",
                    color: activeTab === "usuarios" ? "#FFFFFF" : "#666666",
                  }}
                >
                  <span>👥</span>
                  <span>Usuarios</span>
                </button>
                <button
                  onClick={() => setActiveTab("solicitudes")}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === "solicitudes" ? "#C7B8EA" : "transparent",
                    color: activeTab === "solicitudes" ? "#FFFFFF" : "#666666",
                  }}
                >
                  <span>📋</span>
                  <span>Solicitudes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="mb-16">
            {activeTab === "usuarios" ? (
              <div className="bg-white rounded-xl shadow-lg border" style={{ borderColor: "#E5E5E5" }}>
                {/* Header de usuarios con búsqueda y filtros */}
                <div className="p-6 border-b" style={{ borderBottomColor: "#E5E5E5" }}>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center space-x-2" style={{ color: "#666666" }}>
                        <span>👥</span>
                        <span>Gestión de Usuarios</span>
                      </h2>
                      <p className="mt-1" style={{ color: "#999999" }}>
                        Administra todos los usuarios registrados en el sistema
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="🔍 Buscar usuarios..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full sm:w-64 px-4 py-2 border rounded-lg transition-colors"
                          style={{
                            borderColor: "#E5E5E5",
                            color: "#666666",
                          }}
                        />
                      </div>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border rounded-lg transition-colors"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                      >
                        <option value="all">🔽 Todos los roles</option>
                        <option value="centro_medico">🏥 Centros Médicos</option>
                        <option value="medico">👨‍⚕️ Médicos</option>
                        <option value="paciente">👤 Pacientes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-8">
                    {Object.entries(filteredUsuarios).map(([rol, listaUsuarios]) => (
                      <div key={rol}>
                        <div className="flex items-center space-x-3 mb-6">
                          <span className="text-2xl">{getRoleIcon(rol)}</span>
                          <h3 className="text-xl font-semibold capitalize" style={{ color: "#666666" }}>
                            {rol.replace("_", " ")}
                          </h3>
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium border"
                            style={getRoleBadgeStyle(rol)}
                          >
                            {listaUsuarios.length}
                          </span>
                        </div>

                        {listaUsuarios.length === 0 ? (
                          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: "#F8F8F8" }}>
                            <span className="text-4xl mb-4 block">👤</span>
                            <p className="text-lg font-medium" style={{ color: "#999999" }}>
                              No hay usuarios en este rol
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#F8F8F8" }}>
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead style={{ backgroundColor: "#E5E5E5" }}>
                                  <tr>
                                    <th
                                      className="px-6 py-4 text-left text-sm font-semibold"
                                      style={{ color: "#666666" }}
                                    >
                                      Usuario
                                    </th>
                                    <th
                                      className="px-6 py-4 text-left text-sm font-semibold"
                                      style={{ color: "#666666" }}
                                    >
                                      Estado
                                    </th>
                                    <th
                                      className="px-6 py-4 text-left text-sm font-semibold"
                                      style={{ color: "#666666" }}
                                    >
                                      Fecha
                                    </th>
                                    <th
                                      className="px-6 py-4 text-right text-sm font-semibold"
                                      style={{ color: "#666666" }}
                                    >
                                      Acciones
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y" style={{ borderColor: "#E5E5E5" }}>
                                  {listaUsuarios.map((usuario) => (
                                    <tr key={usuario.uid} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                          <div
                                            className="h-10 w-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: "#C7B8EA" }}
                                          >
                                            <span className="text-white font-semibold">
                                              {usuario.email.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <span className="font-medium" style={{ color: "#666666" }}>
                                            {usuario.email}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span
                                          className="px-3 py-1 rounded-full text-sm font-medium"
                                          style={{
                                            backgroundColor: usuario.disabled ? "#FEF2F2" : "#F0FDF4",
                                            color: usuario.disabled ? "#DC2626" : "#16A34A",
                                          }}
                                        >
                                          {usuario.disabled ? "❌ Desactivado" : "✅ Activo"}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-sm" style={{ color: "#999999" }}>
                                        {usuario.createdAt || "No disponible"}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => {
                                              setSelectedUser(usuario)
                                              setShowDeleteModal(true)
                                            }}
                                            className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center space-x-1"
                                            style={{ backgroundColor: "#EF4444" }}
                                          >
                                            <span>🗑️</span>
                                            <span>Eliminar</span>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        {rol !== Object.keys(filteredUsuarios)[Object.keys(filteredUsuarios).length - 1] && (
                          <hr className="my-8" style={{ borderColor: "#E5E5E5" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border" style={{ borderColor: "#E5E5E5" }}>
                {/* Header de solicitudes */}
                <div className="p-6 border-b" style={{ borderBottomColor: "#E5E5E5" }}>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center space-x-2" style={{ color: "#666666" }}>
                        <span>📋</span>
                        <span>Solicitudes de Registro</span>
                      </h2>
                      <p className="mt-1" style={{ color: "#999999" }}>
                        Revisa y procesa las solicitudes pendientes de aprobación
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Buscar solicitudes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border rounded-lg transition-colors"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {filteredSolicitudes.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#999999" }}>
                      <span className="text-6xl mb-6 block">📋</span>
                      <h3 className="text-xl font-semibold mb-2">No hay solicitudes</h3>
                      <p>No se encontraron solicitudes pendientes de procesamiento</p>
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#F8F8F8" }}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead style={{ backgroundColor: "#E5E5E5" }}>
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                                Solicitante
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                                Contacto
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                                Estado
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#666666" }}>
                                Fecha
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: "#666666" }}>
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y" style={{ borderColor: "#E5E5E5" }}>
                            {filteredSolicitudes.map((solicitud) => (
                              <tr key={solicitud.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className="h-10 w-10 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: "#89CCC9" }}
                                    >
                                      <span className="text-white font-semibold">
                                        {solicitud.nombre.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium" style={{ color: "#666666" }}>
                                        {solicitud.nombre}
                                      </p>
                                      <p className="text-sm" style={{ color: "#999999" }}>
                                        {solicitud.correo}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: "#666666" }}>
                                  {solicitud.telefono}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                      backgroundColor: solicitud.procesado ? "#F0FDF4" : "#FEF3C7",
                                      color: solicitud.procesado ? "#16A34A" : "#D97706",
                                    }}
                                  >
                                    {solicitud.procesado ? "✅ Procesado" : "⏳ Pendiente"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: "#999999" }}>
                                  {solicitud.fechaCreacion || "No disponible"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    {!solicitud.procesado ? (
                                      <>
                                        <select
                                          value={rolSeleccionado[solicitud.id] || ""}
                                          onChange={(e) =>
                                            setRolSeleccionado((prev) => ({
                                              ...prev,
                                              [solicitud.id]: e.target.value,
                                            }))
                                          }
                                          className="px-3 py-2 border rounded-lg text-sm"
                                          style={{
                                            borderColor: "#E5E5E5",
                                            color: "#666666",
                                          }}
                                        >
                                          <option value="">Seleccionar rol</option>
                                          <option value="ADMINISTRADOR">🛡️ Administrador</option>
                                          <option value="CENTRO_MEDICO">🏥 Centro Médico</option>
                                          <option value="MEDICO">👨‍⚕️ Médico</option>
                                          <option value="PACIENTE">👤 Paciente</option>
                                        </select>
                                        <button
                                          onClick={() => procesarSolicitud(solicitud.id, rolSeleccionado[solicitud.id])}
                                          className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center space-x-1"
                                          style={{ backgroundColor: "#89CCC9" }}
                                        >
                                          <span>✅</span>
                                          <span>Procesar</span>
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => revertirSolicitud(solicitud.id)}
                                        className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center space-x-1"
                                        style={{ backgroundColor: "#F8D442" }}
                                      >
                                        <span>↩️</span>
                                        <span>Revertir</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => eliminarSolicitud(solicitud.id)}
                                      className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center space-x-1"
                                      style={{ backgroundColor: "#EF4444" }}
                                    >
                                      <span>🗑️</span>
                                      <span>Eliminar</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AdminFooter />
      </div>

      {/* Modal de confirmación para eliminar usuario */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border"
            style={{ borderColor: "#E5E5E5" }}
          >
            <div className="text-center">
              <div
                className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
                style={{ backgroundColor: "#FEF2F2" }}
              >
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#666666" }}>
                Confirmar Eliminación
              </h3>
              <p className="mb-6" style={{ color: "#999999" }}>
                ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.email}</strong>? Esta acción no
                se puede deshacer.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: "#E5E5E5",
                    color: "#666666",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => selectedUser && eliminarUsuario(selectedUser.uid)}
                  className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-1"
                  style={{ backgroundColor: "#EF4444" }}
                >
                  <span>🗑️</span>
                  <span>Eliminar Usuario</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanelPage

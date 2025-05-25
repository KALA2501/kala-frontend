"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { subirImagen } from "../../../services/firebase"
import { useNavigate } from "react-router-dom"
import MenuLateralCentroMedico from "../components/MenuLateralCentroMedico"

const API_GATEWAY = process.env.REACT_APP_GATEWAY

const AgregarPacientePage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    idDocumento: "",
    fechaNacimiento: "",
    codigoCIE: "",
    telefono: "",
    email: "",
    direccion: "",
    etapa: 1,
    genero: "",
    medicoId: "",
    ceNombre: "",
    ceApellido: "",
    ceRelacion: "",
    ceTelefono: "",
    ceDireccion: "",
    ceEmail: "",
  })

  const [imagenSeleccionada, setImagenSeleccionada] = useState(null)
  const [previewImagen, setPreviewImagen] = useState(null)
  const [contactoId, setContactoId] = useState(null)
  const [mensaje, setMensaje] = useState("")
  const [medicos, setMedicos] = useState([])
  const [centro, setCentro] = useState(null)
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [paso, setPaso] = useState(1)

  // Para el menú lateral
  const [centroNombre, setCentroNombre] = useState("")
  const [centroLogo, setCentroLogo] = useState("")

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMensaje("❌ No hay usuario autenticado")
        return
      }

      try {
        setLoading(true)
        const idToken = await user.getIdToken()
        setToken(idToken)

        const centroRes = await axios.get(`${API_GATEWAY}/api/centro-medico/buscar-por-correo?correo=${user.email}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        })

        setCentro(centroRes.data)
        setCentroNombre(centroRes.data.nombre || "")
        setCentroLogo(centroRes.data.urlLogo || "")

        const medicosRes = await axios.get(`${API_GATEWAY}/api/medicos/centro-medico/${centroRes.data.pkId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        })

        setMedicos(medicosRes.data)
      } catch (err) {
        console.error(err)
        setMensaje("❌ Error al cargar centro médico o médicos")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagen = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagenSeleccionada(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewImagen(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const crearContactoEmergencia = async () => {
    if (!formData.ceNombre || !formData.ceApellido || !formData.ceTelefono) {
      setMensaje("❌ Complete los campos obligatorios del contacto de emergencia")
      return
    }

    try {
      setLoading(true)
      const contacto = {
        nombre: formData.ceNombre,
        apellido: formData.ceApellido,
        relacion: formData.ceRelacion,
        direccion: formData.ceDireccion,
        telefono: formData.ceTelefono,
        email: formData.ceEmail,
      }

      const res = await axios.post(`${API_GATEWAY}/api/contacto-emergencia/crear`, contacto, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setContactoId(res.data.pkId)
      setMensaje("✅ Contacto de emergencia creado exitosamente")
      setPaso(2)
    } catch (err) {
      console.error(err)
      setMensaje("❌ Error al crear contacto de emergencia")
    } finally {
      setLoading(false)
    }
  }

  const registrarPaciente = async () => {
    if (!contactoId || !centro) {
      setMensaje("⚠️ Asegúrate de crear el contacto y que el centro esté cargado")
      return
    }

    if (!formData.nombre || !formData.apellido || !formData.idDocumento) {
      setMensaje("❌ Complete los campos obligatorios del paciente")
      return
    }

    try {
      setLoading(true)
      let urlImagen = ""
      if (imagenSeleccionada) {
        urlImagen = await subirImagen(imagenSeleccionada, "pacientes")
      }

      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipoDocumento: { id: formData.tipoDocumento },
        idDocumento: formData.idDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        codigoCIE: Number.parseInt(formData.codigoCIE),
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        etapa: Number.parseInt(formData.etapa),
        genero: formData.genero,
        urlImagen,
        contactoEmergencia: { pkId: contactoId },
        centroMedico: { pkId: centro.pkId },
        medico: { pkId: formData.medicoId },
        tipoVinculacion: { id: "TV02" },
      }

      await axios.post(`${API_GATEWAY}/api/pacientes/registrar-completo`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setMensaje("✅ Paciente registrado correctamente")
      setTimeout(() => navigate("/panel"), 1500)
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setMensaje("❌ Ya existe un paciente registrado con ese correo o documento.")
      } else {
        setMensaje("❌ Error al registrar paciente")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const siguientePaso = () => {
    if (paso === 1) {
      crearContactoEmergencia()
    } else if (paso === 2) {
      registrarPaciente()
    }
  }

  const pasoAnterior = () => {
    if (paso > 1) {
      setPaso(paso - 1)
    }
  }

  if (loading && !centro) {
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
            Cargando...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      {/* Menu lateral */}
      <MenuLateralCentroMedico centroNombre={centroNombre} centroLogo={centroLogo} />

      {/* Contenido principal */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border p-6 mb-6" style={{ borderColor: "#E5E5E5" }}>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Registro de Paciente
                </h1>
                <p style={{ color: "#999999" }}>Complete la información del nuevo paciente</p>
              </div>
            </div>
          </div>

          {/* Indicador de pasos */}
          <div className="bg-white rounded-xl shadow-lg border p-6 mb-6" style={{ borderColor: "#E5E5E5" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                    paso >= 1 ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: paso >= 1 ? "#C7B8EA" : "#E5E5E5" }}
                >
                  1
                </div>
                <div className="h-1 w-16" style={{ backgroundColor: paso >= 2 ? "#C7B8EA" : "#E5E5E5" }}></div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                    paso >= 2 ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: paso >= 2 ? "#C7B8EA" : "#E5E5E5" }}
                >
                  2
                </div>
              </div>
              <div className="text-sm" style={{ color: "#999999" }}>
                Paso {paso} de 2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium" style={{ color: paso >= 1 ? "#666666" : "#999999" }}>
                Contacto de Emergencia
              </span>
              <span className="text-sm font-medium" style={{ color: paso >= 2 ? "#666666" : "#999999" }}>
                Datos del Paciente
              </span>
            </div>
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div
              className="p-4 rounded-xl border-l-4 shadow-md mb-6"
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
          )}

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-lg border" style={{ borderColor: "#E5E5E5" }}>
            {paso === 1 && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC920" }}>
                    <span className="text-xl">🚨</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
                    Contacto de Emergencia
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Nombre *
                    </label>
                    <input
                      name="ceNombre"
                      placeholder="Nombre del contacto"
                      value={formData.ceNombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Apellido *
                    </label>
                    <input
                      name="ceApellido"
                      placeholder="Apellido del contacto"
                      value={formData.ceApellido}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Relación
                    </label>
                    <input
                      name="ceRelacion"
                      placeholder="Ej: Madre, Padre, Hermano"
                      value={formData.ceRelacion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Teléfono *
                    </label>
                    <input
                      name="ceTelefono"
                      placeholder="Número de teléfono"
                      value={formData.ceTelefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Dirección
                    </label>
                    <input
                      name="ceDireccion"
                      placeholder="Dirección del contacto"
                      value={formData.ceDireccion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Email
                    </label>
                    <input
                      name="ceEmail"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.ceEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paso === 2 && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
                    <span className="text-xl">👤</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
                    Datos del Paciente
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Nombre *
                    </label>
                    <input
                      name="nombre"
                      placeholder="Nombre del paciente"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Apellido *
                    </label>
                    <input
                      name="apellido"
                      placeholder="Apellido del paciente"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Tipo de Documento
                    </label>
                    <select
                      name="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="CE">Cédula de Extranjería</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Número de Documento *
                    </label>
                    <input
                      name="idDocumento"
                      placeholder="Número de documento"
                      value={formData.idDocumento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Fecha de Nacimiento
                    </label>
                    <input
                      name="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Género
                    </label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    >
                      <option value="">Seleccione género</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Código CIE
                    </label>
                    <input
                      name="codigoCIE"
                      placeholder="Código CIE"
                      value={formData.codigoCIE}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Teléfono
                    </label>
                    <input
                      name="telefono"
                      placeholder="Número de teléfono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Etapa
                    </label>
                    <input
                      name="etapa"
                      type="number"
                      placeholder="Etapa"
                      value={formData.etapa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Dirección
                    </label>
                    <input
                      name="direccion"
                      placeholder="Dirección del paciente"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Asignar Médico
                    </label>
                    <select
                      name="medicoId"
                      value={formData.medicoId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    >
                      <option value="">Seleccione un médico</option>
                      {medicos.map((m) => (
                        <option key={m.pkId} value={m.pkId}>
                          {m.nombre} {m.apellido} - {m.especialidad}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#666666" }}>
                      Imagen del Paciente
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagen}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: "#E5E5E5",
                        focusRingColor: "#C7B8EA",
                      }}
                    />
                    {previewImagen && (
                      <div className="mt-3">
                        <img
                          src={previewImagen || "/placeholder.svg"}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                          style={{ borderColor: "#E5E5E5" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="border-t p-6 flex justify-between" style={{ borderTopColor: "#E5E5E5" }}>
              <button
                onClick={pasoAnterior}
                disabled={paso === 1}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: paso === 1 ? "#E5E5E5" : "#89CCC9",
                  color: "#FFFFFF",
                }}
              >
                <span>←</span>
                <span>Anterior</span>
              </button>

              <button
                onClick={siguientePaso}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#C7B8EA",
                  color: "#FFFFFF",
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-4 w-4 border-2 border-t-2"
                      style={{
                        borderColor: "#FFFFFF40",
                        borderTopColor: "#FFFFFF",
                      }}
                    ></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>{paso === 1 ? "Crear Contacto" : "Registrar Paciente"}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgregarPacientePage

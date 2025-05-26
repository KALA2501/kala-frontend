"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import MenuLateralMedico from "./components/MenuLateralMedico"
import { subirImagen } from "../../../services/firebase"

// Componente de ayuda médico profesional
const HelpSystem = ({ isOpen, onClose, currentStep, setCurrentStep, totalSteps }) => {
  const helpSteps = [
    {
      title: "⚙️ Configuración del Perfil",
      content:
        "Esta página te permite actualizar tu información personal y profesional. Mantén tus datos actualizados para una mejor experiencia en la plataforma.",
    },
    {
      title: "👤 Información Personal",
      content:
        "Actualiza tu nombre, apellido, teléfono y dirección. Esta información se mostrará en tu perfil profesional y será visible para pacientes y colegas.",
    },
    {
      title: "👨‍⚕️ Datos Profesionales",
      content:
        "Selecciona tu especialidad médica de la lista disponible y mantén actualizada tu tarjeta profesional. Esta información es crucial para la verificación de tu práctica médica.",
    },
    {
      title: "📷 Foto de Perfil",
      content:
        "Sube una foto profesional que te represente. Se recomienda una imagen clara, de buena calidad y con fondo neutro para proyectar profesionalismo.",
    },
  ]

  const currentStepData = helpSteps[currentStep]

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full border animate-fadeInBlur"
          style={{ borderColor: "#E5E5E5" }}
        >
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

const API_GATEWAY = process.env.REACT_APP_GATEWAY

const ConfiguracionMedicoPageEnhanced = () => {
  const [medico, setMedico] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    tarjetaProfesional: "",
    genero: "",
    urlImagen: "",
  })
  const [mensaje, setMensaje] = useState("")
  const [token, setToken] = useState("")
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Estados para el sistema de ayuda
  const [showHelp, setShowHelp] = useState(false)
  const [helpStep, setHelpStep] = useState(0)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tkn = await user.getIdToken()
          setToken(tkn)
          const res = await axios.get(
            `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
            { headers: { Authorization: `Bearer ${tkn}` } },
          )
          setMedico(res.data)
          setFormData({
            nombre: res.data.nombre || "",
            apellido: res.data.apellido || "",
            telefono: res.data.telefono || "",
            direccion: res.data.direccion || "",
            especialidad: res.data.especialidad || "",
            tarjetaProfesional: res.data.tarjetaProfesional || "",
            genero: res.data.genero || "",
            urlImagen: res.data.urlImagen || "",
          })
          setVistaPrevia(res.data.urlImagen || "")
          setMensaje("✅ Datos cargados correctamente")
        } catch (err) {
          setMensaje("❌ Error cargando tus datos.")
        } finally {
          setLoading(false)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagen = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setMensaje("❌ Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMensaje("❌ El archivo es demasiado grande. Máximo 5MB")
      return
    }

    try {
      setUploadingImage(true)
      setMensaje("Subiendo imagen...")
      const url = await subirImagen(file, "medicos")
      setVistaPrevia(url)
      setFormData((prev) => ({ ...prev, urlImagen: url }))
      setMensaje("✅ Imagen subida correctamente")
    } catch (error) {
      console.error("Error al subir imagen:", error)
      setMensaje("❌ Error al subir la imagen")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!medico) return

    setMensaje("Guardando cambios...")
    try {
      const medicoAEnviar = {
        ...formData,
        centroMedico: { pkId: medico.centroMedico?.pkId },
        tipoDocumento: { id: medico.tipoDocumento?.id },
      }

      await axios.put(`${API_GATEWAY}/api/medicos/${medico.pkId}`, medicoAEnviar, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMensaje("✅ Datos actualizados correctamente")
      setMedico({ ...medico, ...medicoAEnviar })
    } catch (err) {
      console.error("Error actualizando:", err)
      setMensaje("❌ Error al actualizar datos")
    }
  }

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
              Cargando configuración...
            </h2>
            <p className="mt-2" style={{ color: "#999999" }}>
              Por favor espera un momento
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: "#C7B8EA" }}>
                <span className="text-white text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Configuración del Perfil Médico
                </h1>
                <p style={{ color: "#999999" }}>Actualiza tu información personal y profesional</p>
              </div>
            </div>
          </div>

          {/* Mensajes de alerta */}
          {mensaje && (
            <div className="mb-6">
              <div
                className="p-4 rounded-xl border-l-4 shadow-md animate-fadeInBlur"
                style={{
                  backgroundColor: mensaje.includes("❌")
                    ? "#FEF2F2"
                    : mensaje.includes("Subiendo") || mensaje.includes("Guardando")
                      ? "#FEF3C7"
                      : "#F0FDF4",
                  borderLeftColor: mensaje.includes("❌")
                    ? "#EF4444"
                    : mensaje.includes("Subiendo") || mensaje.includes("Guardando")
                      ? "#F59E0B"
                      : "#22C55E",
                  color: mensaje.includes("❌")
                    ? "#DC2626"
                    : mensaje.includes("Subiendo") || mensaje.includes("Guardando")
                      ? "#D97706"
                      : "#16A34A",
                }}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">
                    {mensaje.includes("❌")
                      ? "⚠️"
                      : mensaje.includes("Subiendo") || mensaje.includes("Guardando")
                        ? "⏳"
                        : "✅"}
                  </span>
                  <p className="font-medium">{mensaje}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información del Médico */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-xl shadow-lg border p-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: "#666666" }}>
                  Información Personal
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Nombre
                      </label>
                      <input
                        className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Apellido
                      </label>
                      <input
                        className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Teléfono
                      </label>
                      <input
                        className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Número de teléfono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Género
                      </label>
                      <select
                        className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decir">Prefiero no decir</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                      Dirección
                    </label>
                    <input
                      className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#E5E5E5",
                        color: "#666666",
                      }}
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Profesión
                      </label>
                      <input
                        className="w-full border rounded-lg px-4 py-3 bg-gray-50"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#999999",
                        }}
                        value="Médico"
                        disabled
                      />
                      <p className="text-xs mt-1" style={{ color: "#999999" }}>
                        La profesión no se puede modificar
                      </p>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Especialidad
                      </label>
                      <select
                        className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: "#E5E5E5",
                          color: "#666666",
                        }}
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar especialidad</option>
                        <option value="Geriatría">Geriatría</option>
                        <option value="Neurología">Neurología</option>
                        <option value="Psiquiatría">Psiquiatría</option>
                        <option value="Neuropsicología">Neuropsicología</option>
                        <option value="Neurogeriatría">Neurogeriatría</option>
                        <option value="Otra">Otra</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                      Tarjeta Profesional
                    </label>
                    <input
                      className="w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#E5E5E5",
                        color: "#666666",
                      }}
                      name="tarjetaProfesional"
                      value={formData.tarjetaProfesional}
                      onChange={handleChange}
                      placeholder="Número de tarjeta profesional"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                      Correo Electrónico
                    </label>
                    <input
                      className="w-full border rounded-lg px-4 py-3 transition-colors bg-gray-50"
                      style={{
                        borderColor: "#E5E5E5",
                        color: "#999999",
                      }}
                      value={medico?.correo || ""}
                      disabled
                    />
                    <p className="text-xs mt-1" style={{ color: "#999999" }}>
                      El correo no se puede modificar
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      style={{
                        backgroundColor: "#C7B8EA",
                        color: "#FFFFFF",
                      }}
                      disabled={uploadingImage}
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>

              {/* Información del Centro Médico */}
              <div
                className="bg-white rounded-xl shadow-lg border p-6 mt-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: "#666666" }}>
                  Centro Médico Asignado
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                      Nombre del Centro
                    </label>
                    <input
                      className="w-full border rounded-lg px-4 py-3 bg-gray-50"
                      style={{
                        borderColor: "#E5E5E5",
                        color: "#999999",
                      }}
                      value={medico?.centroMedico?.nombre || "No asignado"}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                      Tipo de Documento
                    </label>
                    <input
                      className="w-full border rounded-lg px-4 py-3 bg-gray-50"
                      style={{
                        borderColor: "#E5E5E5",
                        color: "#999999",
                      }}
                      value={medico?.tipoDocumento?.tipo || "No especificado"}
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "#F0F9FF" }}>
                  <p className="text-sm" style={{ color: "#0369A1" }}>
                    ℹ️ La información del centro médico es asignada por el administrador y no puede ser modificada.
                  </p>
                </div>
              </div>
            </div>

            {/* Foto de Perfil */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-xl shadow-lg border p-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: "#666666" }}>
                  Foto de Perfil
                </h2>

                <div className="text-center">
                  {/* Preview de la imagen */}
                  <div className="mb-6">
                    {vistaPrevia ? (
                      <div className="relative inline-block">
                        <img
                          src={vistaPrevia || "/placeholder.svg?height=128&width=128"}
                          alt="Foto de perfil"
                          className="w-32 h-32 rounded-full object-cover border-4 shadow-lg mx-auto"
                          style={{ borderColor: "#C7B8EA" }}
                        />
                        <div
                          className="absolute -bottom-2 -right-2 p-2 rounded-full shadow-md"
                          style={{ backgroundColor: "#89CCC9" }}
                        >
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-32 h-32 rounded-full border-4 border-dashed mx-auto flex items-center justify-center"
                        style={{ borderColor: "#E5E5E5" }}
                      >
                        <span className="text-4xl" style={{ color: "#999999" }}>
                          👤
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Input para subir imagen */}
                  <div className="space-y-4">
                    <label
                      className="block w-full py-3 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-solid"
                      style={{
                        borderColor: uploadingImage ? "#F59E0B" : "#C7B8EA",
                        backgroundColor: uploadingImage ? "#FEF3C7" : "#C7B8EA10",
                        color: "#666666",
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {uploadingImage ? (
                          <>
                            <div
                              className="animate-spin rounded-full h-6 w-6 border-2 border-t-2"
                              style={{
                                borderColor: "#E5E5E5",
                                borderTopColor: "#F59E0B",
                              }}
                            ></div>
                            <span className="text-sm font-medium">Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium">{vistaPrevia ? "Cambiar Foto" : "Subir Foto"}</span>
                            <span className="text-xs" style={{ color: "#999999" }}>
                              PNG, JPG hasta 5MB
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagen}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>

                    {vistaPrevia && (
                      <button
                        type="button"
                        onClick={() => {
                          setVistaPrevia("")
                          setFormData((prev) => ({ ...prev, urlImagen: "" }))
                        }}
                        className="text-sm px-4 py-2 rounded-lg transition-colors"
                        style={{
                          color: "#EF4444",
                          backgroundColor: "#FEF2F2",
                        }}
                      >
                        Eliminar Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div
                className="bg-white rounded-xl shadow-lg border p-6 mt-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: "#666666" }}>
                  Recomendaciones
                </h3>
                <div className="space-y-3 text-sm" style={{ color: "#999999" }}>
                  <p>• Usa una foto profesional y clara</p>
                  <p>• Recomendamos fondo neutro</p>
                  <p>• Formato PNG para mejor calidad</p>
                  <p>• La foto se mostrará en tu perfil</p>
                </div>
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
                    <span className="text-xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: "#666666" }}>
                      Ayuda - Perfil
                    </h4>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Configuración Médica
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
                      Aprende a configurar tu perfil
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Scroll to personal info section
                    document.querySelector("h2").scrollIntoView({ behavior: "smooth" })
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#89CCC910", border: "1px solid #89CCC920" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC9" }}>
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Información Personal
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Actualizar datos básicos
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Scroll to photo section
                    const photoSection = document.querySelector("h2:last-of-type")
                    if (photoSection) photoSection.scrollIntoView({ behavior: "smooth" })
                    setShowQuickHelp(false)
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#F8D44210", border: "1px solid #F8D44220" }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#F8D442" }}>
                    <span className="text-white text-sm">📷</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: "#666666" }}>
                      Foto de Perfil
                    </p>
                    <p className="text-xs" style={{ color: "#999999" }}>
                      Subir imagen profesional
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer del menú */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
                <p className="text-xs text-center" style={{ color: "#999999" }}>
                  Mantén tu perfil actualizado para una mejor experiencia
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfiguracionMedicoPageEnhanced

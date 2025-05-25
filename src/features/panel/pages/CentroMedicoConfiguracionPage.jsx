"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { subirImagen } from "../../../services/firebase"
import MenuLateralCentroMedico from "../components/MenuLateralCentroMedico"

const API_GATEWAY = process.env.REACT_APP_GATEWAY

const CentroMedicoConfiguracionPage = () => {
  const [centro, setCentro] = useState(null)
  const [logo, setLogo] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    correo: "",
    urlLogo: "",
  })

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken()
          const res = await axios.get(
            `${API_GATEWAY}/api/centro-medico/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          setCentro(res.data)
          setFormData({
            nombre: res.data.nombre,
            telefono: res.data.telefono,
            direccion: res.data.direccion,
            correo: res.data.correo,
            urlLogo: res.data.urlLogo,
          })
          setLogo(res.data.urlLogo)
        } catch (err) {
          setMensaje("❌ Error al cargar datos del centro médico")
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

  const handleLogo = async (e) => {
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
      setUploadingLogo(true)
      setMensaje("Subiendo logo...")
      const url = await subirImagen(file, "centros-medicos")
      setLogo(url)
      setFormData((prev) => ({ ...prev, urlLogo: url }))
      setMensaje("✅ Logo subido correctamente")
    } catch (error) {
      console.error("Error al subir logo:", error)
      setMensaje("❌ Error al subir el logo")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje("Guardando cambios...")
    try {
      const auth = getAuth()
      const user = auth.currentUser
      const token = await user.getIdToken()
      await axios.put(
        `${API_GATEWAY}/api/centro-medico/${centro.pkId}`,
        {
          ...formData,
          urlLogo: logo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setMensaje("✅ Datos actualizados correctamente")
    } catch (err) {
      console.error("Error al actualizar:", err)
      setMensaje("❌ Error al actualizar datos")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
        <MenuLateralCentroMedico />
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
      <MenuLateralCentroMedico />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: "#89CCC9" }}>
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#666666" }}>
                  Configuración del Centro Médico
                </h1>
                <p style={{ color: "#999999" }}>Actualiza la información y configuración de tu centro médico</p>
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
            {/* Información del Centro */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-xl shadow-lg border p-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: "#666666" }}>
                  Información del Centro
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: "#666666" }}>
                        Nombre del Centro
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
                        placeholder="Ingresa el nombre del centro"
                        required
                      />
                    </div>

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
                      placeholder="Dirección completa del centro"
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
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="correo@centro.com"
                      required
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
                      disabled={uploadingLogo}
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Logo del Centro */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-xl shadow-lg border p-6 animate-fadeInBlur"
                style={{ borderColor: "#E5E5E5" }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: "#666666" }}>
                  Logo del Centro
                </h2>

                <div className="text-center">
                  {/* Preview del logo */}
                  <div className="mb-6">
                    {logo ? (
                      <div className="relative inline-block">
                        <img
                          src={logo || "/placeholder.svg"}
                          alt="Logo del centro"
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
                          🏥
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Input para subir logo */}
                  <div className="space-y-4">
                    <label
                      className="block w-full py-3 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-solid"
                      style={{
                        borderColor: uploadingLogo ? "#F59E0B" : "#C7B8EA",
                        backgroundColor: uploadingLogo ? "#FEF3C7" : "#C7B8EA10",
                        color: "#666666",
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {uploadingLogo ? (
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
                            <span className="text-sm font-medium">{logo ? "Cambiar Logo" : "Subir Logo"}</span>
                            <span className="text-xs" style={{ color: "#999999" }}>
                              PNG, JPG hasta 5MB
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogo}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>

                    {logo && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogo("")
                          setFormData((prev) => ({ ...prev, urlLogo: "" }))
                        }}
                        className="text-sm px-4 py-2 rounded-lg transition-colors"
                        style={{
                          color: "#EF4444",
                          backgroundColor: "#FEF2F2",
                        }}
                      >
                        Eliminar Logo
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
                  Información
                </h3>
                <div className="space-y-3 text-sm" style={{ color: "#999999" }}>
                  <p>• El logo se mostrará en toda la plataforma</p>
                  <p>• Recomendamos imágenes cuadradas</p>
                  <p>• Formato PNG para mejor calidad</p>
                  <p>• Los cambios se guardan automáticamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CentroMedicoConfiguracionPage

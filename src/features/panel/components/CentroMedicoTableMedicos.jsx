"use client"

const CentroMedicoTableMedicos = ({ medicos, eliminarMedico }) => {
  return (
    <div className="w-full">
      {/* Header de la tabla */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#C7B8EA20" }}>
            <span className="text-xl">👨‍⚕️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
              Lista de Médicos
            </h2>
            <p style={{ color: "#999999" }}>
              {medicos.length} médico{medicos.length !== 1 ? "s" : ""} registrado{medicos.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {medicos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border p-12 text-center" style={{ borderColor: "#E5E5E5" }}>
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#C7B8EA20" }}
          >
            <span className="text-4xl">👨‍⚕️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "#666666" }}>
            No hay médicos registrados
          </h3>
          <p style={{ color: "#999999" }}>Comienza agregando el primer médico a tu centro</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden" style={{ borderColor: "#E5E5E5" }}>
          {/* Tabla para pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: "#C7B8EA" }}>
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-white">Médico</th>
                  <th className="py-4 px-6 text-left font-semibold text-white">Especialidad</th>
                  <th className="py-4 px-6 text-left font-semibold text-white">Contacto</th>
                  <th className="py-4 px-6 text-center font-semibold text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicos.map((medico, index) => (
                  <tr
                    key={medico.pkId}
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{ borderBottomColor: "#E5E5E5" }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
                          style={{ backgroundColor: "#89CCC9" }}
                        >
                          {medico.nombre.charAt(0)}
                          {medico.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#666666" }}>
                            {`${medico.nombre} ${medico.apellido}`}
                          </p>
                          <p className="text-sm" style={{ color: "#999999" }}>
                            ID: {medico.idDocumento}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: "#C7B8EA20",
                          color: "#666666",
                        }}
                      >
                        {medico.especialidad}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium" style={{ color: "#666666" }}>
                          {medico.telefono}
                        </p>
                        {medico.correo && (
                          <p className="text-sm" style={{ color: "#999999" }}>
                            {medico.correo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => eliminarMedico(medico.pkId)}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                        style={{
                          backgroundColor: "#EF4444",
                          color: "#FFFFFF",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#DC2626"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#EF4444"
                        }}
                      >
                        <span>🗑️</span>
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards para pantallas pequeñas */}
          <div className="md:hidden p-4 space-y-4">
            {medicos.map((medico, index) => (
              <div key={medico.pkId} className="border rounded-lg p-4 space-y-3" style={{ borderColor: "#E5E5E5" }}>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                    style={{ backgroundColor: "#89CCC9" }}
                  >
                    {medico.nombre.charAt(0)}
                    {medico.apellido.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: "#666666" }}>
                      {`${medico.nombre} ${medico.apellido}`}
                    </h3>
                    <p className="text-sm" style={{ color: "#999999" }}>
                      ID: {medico.idDocumento}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "#999999" }}>
                      Especialidad:
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: "#C7B8EA20",
                        color: "#666666",
                      }}
                    >
                      {medico.especialidad}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "#999999" }}>
                      Teléfono:
                    </span>
                    <span className="text-sm font-medium" style={{ color: "#666666" }}>
                      {medico.telefono}
                    </span>
                  </div>

                  {medico.correo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "#999999" }}>
                        Email:
                      </span>
                      <span className="text-sm" style={{ color: "#666666" }}>
                        {medico.correo}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t" style={{ borderTopColor: "#E5E5E5" }}>
                  <button
                    onClick={() => eliminarMedico(medico.pkId)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: "#EF4444",
                      color: "#FFFFFF",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#DC2626"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#EF4444"
                    }}
                  >
                    <span>🗑️</span>
                    <span>Eliminar Médico</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CentroMedicoTableMedicos

"use client"

const CentroMedicoTablePacientes = ({ pacientes }) => {
  return (
    <div className="w-full">
      {/* Header de la tabla */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#89CCC920" }}>
            <span className="text-xl">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#666666" }}>
              Lista de Pacientes
            </h2>
            <p style={{ color: "#999999" }}>
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} registrado{pacientes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {pacientes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border p-12 text-center" style={{ borderColor: "#E5E5E5" }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#89CCC920" }}>
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "#666666" }}>
            No hay pacientes registrados
          </h3>
          <p style={{ color: "#999999" }}>Los pacientes aparecerán aquí cuando se registren en el sistema</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden" style={{ borderColor: "#E5E5E5" }}>
          {/* Tabla para pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: "#89CCC9" }}>
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-white">Paciente</th>
                  <th className="py-4 px-6 text-left font-semibold text-white">Documento</th>
                  <th className="py-4 px-6 text-left font-semibold text-white">Teléfono</th>
                  <th className="py-4 px-6 text-left font-semibold text-white">Médicos Asignados</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((paciente, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors" style={{ borderBottomColor: "#E5E5E5" }}>
                    <td className="py-4 px-6 capitalize">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: "#A694E0" }}>
                          {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#666666" }}>
                            {`${paciente.nombre} ${paciente.apellido}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{paciente.idDocumento}</td>
                    <td className="py-4 px-6">{paciente.telefono}</td>
                    <td className="py-4 px-6">
                      {paciente.medicos?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {paciente.medicos.map((medico, i) => (
                            <span key={i} className="inline-block bg-[#E6E6FA] text-[#30028D] px-3 py-1 rounded-full text-xs font-medium">
                              👨‍⚕️ {medico.nombre} {medico.apellido}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                          Sin médicos asignados
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards para pantallas pequeñas */}
          <div className="md:hidden p-4 space-y-4">
            {pacientes.map((paciente, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3" style={{ borderColor: "#E5E5E5" }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: "#A694E0" }}>
                    {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold capitalize" style={{ color: "#666666" }}>
                      {paciente.nombre} {paciente.apellido}
                    </h3>
                    <p className="text-sm" style={{ color: "#999999" }}>
                      ID: {paciente.idDocumento}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium block text-gray-500">Teléfono:</span>
                    <span className="text-sm font-medium text-gray-700">{paciente.telefono}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block text-gray-500">Médicos:</span>
                    {paciente.medicos?.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {paciente.medicos.map((medico, i) => (
                          <span key={i} className="inline-block bg-[#E6E6FA] text-[#30028D] px-3 py-1 rounded-full text-xs font-medium">
                            👨‍⚕️ {medico.nombre} {medico.apellido}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Sin médicos asignados
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CentroMedicoTablePacientes

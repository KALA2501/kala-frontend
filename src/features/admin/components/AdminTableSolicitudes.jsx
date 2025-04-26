// src/features/admin/components/AdminTableSolicitudes.jsx
import React from 'react';

const AdminTableSolicitudes = ({
    solicitudes,
    rolSeleccionado,
    setRolSeleccionado,
    procesarSolicitud,
    eliminarSolicitud,
    revertirSolicitud
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#30028D] mb-6">Solicitudes de Registro</h2>

            {solicitudes.length === 0 ? (
                <p className="text-gray-600">No hay solicitudes pendientes.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-[#F9CFA7]">
                            <tr>
                                <th className="py-3 px-6 text-left font-semibold">Nombre</th>
                                <th className="py-3 px-6 text-left font-semibold">Correo</th>
                                <th className="py-3 px-6 text-left font-semibold">Teléfono</th>
                                <th className="py-3 px-6 text-left font-semibold">Estado</th>
                                <th className="py-3 px-6 text-left font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map((solicitud) => (
                                <tr key={solicitud.id} className="border-b">
                                    <td className="py-3 px-6">{solicitud.nombre}</td>
                                    <td className="py-3 px-6">{solicitud.correo}</td>
                                    <td className="py-3 px-6">{solicitud.telefono}</td>
                                    <td className="py-3 px-6">{solicitud.estado}</td>
                                    <td className="py-3 px-6 flex flex-col md:flex-row gap-2">
                                        {!solicitud.procesado ? (
                                            <>
                                                <select
                                                    value={rolSeleccionado[solicitud.id] || ''}
                                                    onChange={(e) =>
                                                        setRolSeleccionado((prev) => ({
                                                            ...prev,
                                                            [solicitud.id]: e.target.value
                                                        }))
                                                    }
                                                    className="border border-gray-300 rounded-lg p-2"
                                                >
                                                    <option value="">Seleccionar rol</option>
                                                    <option value="ADMINISTRADOR">Administrador</option>
                                                    <option value="CENTRO_MEDICO">Centro Médico</option>
                                                    <option value="MEDICO">Médico</option>
                                                    <option value="PACIENTE">Paciente</option>
                                                </select>

                                                <button
                                                    onClick={() =>
                                                        procesarSolicitud(solicitud.id, rolSeleccionado[solicitud.id])
                                                    }
                                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                                >
                                                    Procesar
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => revertirSolicitud(solicitud.id)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                                            >
                                                Revertir
                                            </button>
                                        )}

                                        <button
                                            onClick={() => eliminarSolicitud(solicitud.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminTableSolicitudes;

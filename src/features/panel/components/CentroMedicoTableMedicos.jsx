import React from 'react';

const CentroMedicoTableMedicos = ({ medicos, eliminarMedico }) => {
    return (
        <div className="overflow-x-auto mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#30028D] mb-6">Lista de Médicos</h2>

            {medicos.length === 0 ? (
                <p className="text-gray-600">No hay médicos registrados.</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead className="bg-[#F9CFA7]">
                        <tr>
                            <th className="py-3 px-6 text-left font-semibold">Nombre</th>
                            <th className="py-3 px-6 text-left font-semibold">Especialidad</th>
                            <th className="py-3 px-6 text-left font-semibold">Teléfono</th>
                            <th className="py-3 px-6 text-left font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicos.map((medico) => (
                            <tr key={medico.pkId} className="border-b">
                                <td className="py-3 px-6">{`${medico.nombre} ${medico.apellido}`}</td>
                                <td className="py-3 px-6">{medico.especialidad}</td>
                                <td className="py-3 px-6">{medico.telefono}</td>
                                <td className="py-3 px-6">
                                    <button
                                        onClick={() => eliminarMedico(medico.pkId)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CentroMedicoTableMedicos;

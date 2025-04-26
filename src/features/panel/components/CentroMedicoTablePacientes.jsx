import React from 'react';

const CentroMedicoTablePacientes = ({ pacientes }) => {
    return (
        <div className="overflow-x-auto mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#30028D] mb-6">Lista de Pacientes</h2>

            {pacientes.length === 0 ? (
                <p className="text-gray-600">No hay pacientes registrados.</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead className="bg-[#F9CFA7]">
                        <tr>
                            <th className="py-3 px-6 text-left font-semibold">Nombre</th>
                            <th className="py-3 px-6 text-left font-semibold">Documento</th>
                            <th className="py-3 px-6 text-left font-semibold">Teléfono</th>
                            <th className="py-3 px-6 text-left font-semibold">Médicos Asignados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientes.map((paciente) => (
                            <tr key={paciente.id} className="border-b">
                                <td className="py-3 px-6">{`${paciente.nombre} ${paciente.apellido}`}</td>
                                <td className="py-3 px-6">{paciente.idDocumento}</td>
                                <td className="py-3 px-6">{paciente.telefono}</td>
                                <td className="py-3 px-6">
                                    {paciente.medicos?.length > 0
                                        ? paciente.medicos.map((m) => `${m.nombre} ${m.apellido}`).join(', ')
                                        : 'Sin médicos asignados'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CentroMedicoTablePacientes;

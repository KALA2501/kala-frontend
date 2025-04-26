// src/features/admin/components/AdminTableUsuarios.jsx
import React from 'react';

const AdminTableUsuarios = ({ usuarios, eliminarUsuario }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#30028D] mb-6">Usuarios por Rol</h2>

            {Object.entries(usuarios).map(([rol, listaUsuarios]) => (
                <div key={rol} className="mb-10">
                    <h3 className="text-xl font-semibold text-[#7358F5] mb-4 capitalize">
                        {rol.replace('_', ' ')} ({listaUsuarios.length})
                    </h3>

                    {listaUsuarios.length === 0 ? (
                        <p className="text-gray-600">No hay usuarios en este rol.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                <thead className="bg-[#F9CFA7]">
                                    <tr>
                                        <th className="py-3 px-6 text-left font-semibold">Email</th>
                                        <th className="py-3 px-6 text-left font-semibold">Estado</th>
                                        <th className="py-3 px-6 text-left font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaUsuarios.map((usuario) => (
                                        <tr key={usuario.uid} className="border-b">
                                            <td className="py-3 px-6">{usuario.email}</td>
                                            <td className="py-3 px-6">
                                                {usuario.disabled ? 'Desactivado' : 'Activo'}
                                            </td>
                                            <td className="py-3 px-6">
                                                <button
                                                    onClick={() => eliminarUsuario(usuario.uid)}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded-lg transition"
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
            ))}
        </div>
    );
};

export default AdminTableUsuarios;

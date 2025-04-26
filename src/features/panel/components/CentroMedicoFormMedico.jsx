import React from 'react';

const CentroMedicoFormMedico = ({
    formData,
    handleChange,
    handleEspecialidadChange,
    handleImagenMedico,
    handleSubmit,
    logo
}) => {
    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mt-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#30028D] mb-6 text-center">Registrar Nuevo Médico</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <input
                    name="apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PAS">Pasaporte (PAS)</option>
                </select>
                <input
                    name="idDocumento"
                    placeholder="Número de Documento"
                    value={formData.idDocumento}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <input
                    name="profesion"
                    value="Médico"
                    readOnly
                    className="border border-gray-300 rounded-lg p-2 bg-gray-100"
                />
                <select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleEspecialidadChange}
                    className="border border-gray-300 rounded-lg p-2"
                >
                    <option value="Geriatría">Geriatría</option>
                    <option value="Neurología">Neurología</option>
                    <option value="Psiquiatría">Psiquiatría</option>
                    <option value="Neuropsicología">Neuropsicología</option>
                    <option value="Neurogeriatría">Neurogeriatría</option>
                    <option value="Otra">Otra</option>
                </select>

                {formData.especialidad === 'Otra' && (
                    <input
                        name="especialidadCustom"
                        placeholder="Escribe la especialidad"
                        value={formData.especialidadCustom}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-2"
                    />
                )}
                <input
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <input
                    name="direccion"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                >
                    <option value="">Seleccionar género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                </select>
                <input
                    name="tarjetaProfesional"
                    placeholder="Tarjeta Profesional"
                    value={formData.tarjetaProfesional}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <input
                    name="correo"
                    placeholder="Correo Electrónico"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
            </div>

            <div className="mt-6">
                <label className="font-semibold">Imagen del Médico:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenMedico}
                    className="border border-gray-300 rounded-lg p-2 mt-2"
                />
                {logo && (
                    <img
                        src={logo}
                        alt="Imagen del médico"
                        className="mt-4 w-24 h-24 object-cover rounded-lg"
                    />
                )}
            </div>

            <button
                type="submit"
                className="bg-[#7358F5] hover:bg-[#30028D] text-white py-2 px-6 rounded-lg mt-6 block mx-auto transition"
            >
                Registrar Médico
            </button>
        </form>
    );
};

export default CentroMedicoFormMedico;

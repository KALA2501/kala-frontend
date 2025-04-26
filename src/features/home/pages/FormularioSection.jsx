// features/home/pages/FormularioSection.jsx
import React from 'react';

const FormularioSection = ({
    formData,
    errors,
    mensaje,
    subiendoLogo,
    archivoLogo,
    handleChange,
    handleLogoUpload,
    handleSubmit
}) => {
    return (
        <section id="formulario" className="bg-white py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-center text-[#30028D] mb-10">Solicita tu registro como Centro Médico</h2>

                {mensaje && (
                    <p className={`text-center mb-6 ${mensaje.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
                        {mensaje}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        name="nombre"
                        placeholder="Nombre del centro"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                    {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}

                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        name="direccion"
                        placeholder="Dirección"
                        value={formData.direccion}
                        onChange={handleChange}
                    />
                    {errors.direccion && <p className="text-red-500">{errors.direccion}</p>}

                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        type="email"
                        name="correo"
                        placeholder="Correo electrónico"
                        value={formData.correo}
                        onChange={handleChange}
                    />
                    {errors.correo && <p className="text-red-500">{errors.correo}</p>}

                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        type="tel"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                    {errors.telefono && <p className="text-red-500">{errors.telefono}</p>}

                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                    />
                    {errors.urlLogo && <p className="text-red-500">{errors.urlLogo}</p>}

                    {archivoLogo && (
                        <div className="flex justify-center mt-4">
                            <img
                                src={URL.createObjectURL(archivoLogo)}
                                alt="Vista previa"
                                className="w-32 h-32 object-cover rounded-full shadow-md"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={subiendoLogo}
                        className="w-full bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-3 rounded-lg transition"
                    >
                        {subiendoLogo ? 'Subiendo imagen...' : 'Enviar solicitud'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default FormularioSection;

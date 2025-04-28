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
                    <div className="w-full border-2 border-dashed border-[#7358F5] rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-[#f5f0ff] transition relative">
                        {/* Input oculto */}
                        <input
                            id="logoInput"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />

                        {/* Si hay imagen, mostrarla */}
                        {archivoLogo ? (
                            <img
                                src={URL.createObjectURL(archivoLogo)}
                                alt="Vista previa"
                                className="w-full h-48 object-contain rounded-lg"
                            />
                        ) : (
                            <>
                                {/* Ícono */}
                                <svg
                                    className="w-12 h-12 text-[#7358F5] mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 14l3.5-4.5 2.5 3 3.5-4.5L21 19M7 7h.01M12 7h.01M17 7h.01"
                                    />
                                </svg>

                                {/* Texto */}
                                <p className="text-[#7358F5] font-semibold">Haz clic o arrastra una imagen</p>
                                <p className="text-sm text-gray-400 mt-1">Formatos permitidos: JPG, PNG</p>
                            </>
                        )}

                        {/* Error si existe */}
                        {errors.urlLogo && (
                            <p className="text-red-500 text-xs mt-2">{errors.urlLogo}</p>
                        )}
                    </div>


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

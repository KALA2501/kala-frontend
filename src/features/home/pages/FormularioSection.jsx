import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import logoKala from '../../../assets/LogoKala.png';
import { motion } from 'framer-motion';

const beneficios = [
  "Acceso a herramientas de estimulación cognitiva personalizadas",
  "Sistema de recordatorios y organización diaria",
  "Portal para cuidadores con seguimiento en tiempo real",
  "Comunidad de apoyo para familias y cuidadores",
  "Recursos educativos sobre el Alzheimer"
];

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
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden shadow-xl border border-gray-100">
        
        {/* Columna izquierda: Formulario */}
        <div className="bg-white p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#30028D] mb-8 text-center leading-snug">
            Solicita tu registro <br /> como Centro Médico
          </h2>

          {mensaje && (
            <p className={`text-center mb-6 ${mensaje.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
              {mensaje}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
              name="nombre"
              placeholder="Nombre del centro"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}

            <input
              className="w-full p-3 border border-gray-300 rounded-lg"
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
            />
            {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion}</p>}

            <input
              className="w-full p-3 border border-gray-300 rounded-lg"
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
            />
            {errors.correo && <p className="text-red-500 text-sm">{errors.correo}</p>}

            <input
              className="w-full p-3 border border-gray-300 rounded-lg"
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
            />
            {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}

            {/* Subida de imagen */}
            <div className="w-full border-2 border-dashed border-purple rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-purple/10 transition relative">
              <input
                id="logoInput"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {archivoLogo ? (
                <img
                  src={URL.createObjectURL(archivoLogo)}
                  alt="Vista previa"
                  className="w-full h-48 object-contain rounded-lg"
                />
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-purple mb-4"
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
                  <p className="text-purple font-semibold">Haz clic o arrastra una imagen</p>
                  <p className="text-sm text-gray-400 mt-1">Formatos permitidos: JPG, PNG</p>
                </>
              )}

              {errors.urlLogo && (
                <p className="text-red-500 text-xs mt-2">{errors.urlLogo}</p>
              )}
            </div>

            {archivoLogo && (
              <div className="flex justify-center mt-4">
                <img
                  src={URL.createObjectURL(archivoLogo)}
                  alt="Vista previa"
                  className="w-24 h-24 object-cover rounded-full shadow-md"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={subiendoLogo}
              className="w-full bg-purple hover:bg-[#30028D] text-white font-semibold py-3 rounded-lg transition"
            >
              {subiendoLogo ? 'Subiendo imagen...' : 'Enviar solicitud'}
            </button>
          </form>
        </div>

        {/* Columna derecha: Beneficios */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.4 }}
          className="bg-gradient-to-b from-purple to-[#BFAFE0] text-white px-8 py-12 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-4xl md:text-5xl font-extrabold mb-10 leading-snug">
              Beneficios de unirse a KALA
            </h3>
            <ul className="space-y-5 text-base md:text-lg font-semibold">
              {beneficios.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <FiCheckCircle className="text-white text-xl mt-[2px]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 flex justify-center">
            <img
              src={logoKala}
              alt="Logo KALA"
              className="h-20 md:h-24 object-contain drop-shadow-lg"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FormularioSection;

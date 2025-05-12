import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import LogoKala from '../../../../assets/LogoKala.png'; // Asegúrate de que esta ruta sea correcta

const AyudaPopup = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {/* Botón de ayuda */}
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-2 bg-purple text-white px-3 py-2 rounded-md hover:bg-[#b4a5e0] transition"
      >
        <FaQuestionCircle />
        Ayuda
      </button>

      {/* Popup */}
      {visible && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl z-50 border border-purple animate-fadeInBlur">
          {/* Logo centrado */}
          <div className="flex justify-center mt-4">
            <img
              src={LogoKala}
              alt="Logo KALA"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Contenido de la ayuda */}
          <div className="p-4 text-sm text-gray-700">
            <p className="mb-2 font-medium text-center text-[#30028D]">
              ¿Cómo funciona esta página?
            </p>
            <ul className="list-disc ml-5 space-y-1 text-gray-600">
              <li>📋 Aquí verás todos tus pacientes vinculados.</li>
              <li>✅ Los formularios que ya has diligenciado tienen un chulo (✔).</li>
              <li>📝 Usa los botones para llenar o ver cada formulario clínico.</li>
              <li>🔁 Puedes cambiar entre llenar o visualizar con el botón de arriba.</li>
            </ul>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-center pb-4">
            <button
              onClick={() => setVisible(false)}
              className="text-purple hover:underline text-sm mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyudaPopup;

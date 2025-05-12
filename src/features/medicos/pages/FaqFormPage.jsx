import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const FaqFormPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { pacienteId, medicoId } = state || {};
  const [token, setToken] = useState('');

  const [formData, setFormData] = useState({
    manejarDinero: false,
    hacerPaginasYCheques: false,
    irDeCompras: false,
    prepararComidas: false,
    recordarCitas: false,
    usarTelefono: false,
    tomarMedicacion: false,
    manejarAparatosElectricos: false,
    desplazarseFueraCasa: false,
    responderEmergencias: false,
    observaciones: ''
  });

  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tkn = await user.getIdToken();
        setToken(tkn);
      } else {
        alert("Sesión no válida. Inicia sesión.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      paciente: { pkId: pacienteId },
      medico: { pkId: medicoId }
    };

    try {
      await axios.post(`${API_GATEWAY}/api/formularios/faq`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Formulario FAQ enviado correctamente');
      navigate('/formularios');
    } catch (err) {
      console.error(err);
      alert('❌ Error al enviar FAQ');
    }
  };

  const preguntas = [
    ['manejarDinero', '¿Maneja su dinero correctamente?'],
    ['hacerPaginasYCheques', '¿Paga cuentas / llena cheques?'],
    ['irDeCompras', '¿Puede hacer compras?'],
    ['prepararComidas', '¿Prepara sus comidas?'],
    ['recordarCitas', '¿Recuerda sus citas?'],
    ['usarTelefono', '¿Sabe usar el teléfono?'],
    ['tomarMedicacion', '¿Toma su medicación adecuadamente?'],
    ['manejarAparatosElectricos', '¿Maneja aparatos eléctricos?'],
    ['desplazarseFueraCasa', '¿Puede salir de casa solo/a?'],
    ['responderEmergencias', '¿Responde adecuadamente ante emergencias?']
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-lg">
          <h1 className="text-3xl font-bold text-center text-[#30028D] mb-6">Formulario FAQ</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {preguntas.map(([campo, texto]) => (
              <label key={campo} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name={campo}
                  checked={formData[campo]}
                  onChange={handleChange}
                  className="accent-[#7358F5]"
                />
                <span>{texto}</span>
              </label>
            ))}

            <div>
              <label className="block font-semibold mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="Agrega cualquier observación adicional..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7358F5] text-white py-2 px-4 rounded hover:bg-[#30028D]"
            >
              Guardar Evaluación
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default FaqFormPage;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const LawtonFormPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pacienteId, medicoId } = state || {};

  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    usoTelefono: false,
    hacerCompras: false,
    preparacionComida: false,
    cuidadoCasa: false,
    lavadoRopa: false,
    usoTransporte: false,
    manejoMedicacion: false,
    manejoFinanzas: false,
    observaciones: ''
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tkn = await user.getIdToken();
        setToken(tkn);
      } else {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        paciente: { pkId: pacienteId },
        medico: { pkId: medicoId }
      };

      await axios.post(`${API_GATEWAY}/api/formularios/lawton`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('✅ Evaluación registrada con éxito');
      navigate('/formularios');
    } catch (error) {
      console.error('❌ Error al enviar la evaluación:', error);
      alert('❌ Error al enviar la evaluación');
    }
  };

  if (!pacienteId || !medicoId) {
    return <p className="text-center text-red-500 mt-10">❌ Error: paciente o médico no definido</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-[#30028D] mb-6 text-center">Formulario Lawton-Brody</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['usoTelefono', '¿Puede usar el teléfono?'],
              ['hacerCompras', '¿Es capaz de hacer compras?'],
              ['preparacionComida', '¿Puede preparar sus comidas?'],
              ['cuidadoCasa', '¿Mantiene la casa adecuadamente?'],
              ['lavadoRopa', '¿Lava su ropa sin ayuda?'],
              ['usoTransporte', '¿Utiliza transporte público sin problemas?'],
              ['manejoMedicacion', '¿Gestiona su medicación de forma independiente?'],
              ['manejoFinanzas', '¿Controla sus finanzas solo/a?'],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name={name}
                  checked={formData[name]}
                  onChange={handleChange}
                  className="accent-[#7358F5]"
                />
                <span>{label}</span>
              </label>
            ))}

            <textarea
              name="observaciones"
              placeholder="Observaciones adicionales..."
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-4"
              rows="4"
            />

            <button
              type="submit"
              className="w-full bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-3 rounded-lg transition"
            >
              Guardar evaluación
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LawtonFormPage;

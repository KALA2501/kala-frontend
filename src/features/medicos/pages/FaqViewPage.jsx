import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const FaqViewPage = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [evaluacion, setEvaluacion] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tkn = await user.getIdToken();
        setToken(tkn);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (!token || !pacienteId) return;
    const fetchEvaluacion = async () => {
      try {
        const res = await axios.get(`${API_GATEWAY}/api/formularios/faq/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvaluacion(res.data);
      } catch (err) {
        console.error('❌ Error al obtener evaluación FAQ:', err);
        alert('No se encontró evaluación FAQ para este paciente.');
      }
    };
    fetchEvaluacion();
  }, [token, pacienteId]);

  const campos = [
    ['usarTelefono', 'Usar el teléfono'],
    ['prepararComida', 'Preparar la comida'],
    ['hacerCompras', 'Hacer compras'],
    ['manejarFinanzas', 'Manejar finanzas'],
    ['administrarMedicacion', 'Administrar medicación'],
    ['viajarSolo', 'Viajar solo/a'],
    ['recordarCitas', 'Recordar citas'],
    ['cuidarHigiene', 'Cuidar la higiene personal'],
    ['socializar', 'Participar en actividades sociales'],
    ['hacerTareasDomesticas', 'Realizar tareas domésticas']
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-lg">
          <h1 className="text-3xl font-bold text-center text-[#30028D] mb-6">
            Evaluación FAQ del Paciente
          </h1>

          {evaluacion ? (
            <>
              <ul className="space-y-2">
                {campos.map(([key, label]) => (
                  <li key={key} className="flex justify-between border-b py-1">
                    <span>{label}</span>
                    <span className={evaluacion[key] ? 'text-green-600 font-semibold' : 'text-red-500'}>
                      {evaluacion[key] ? '✔ Sí' : '✘ No'}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h3 className="font-semibold mb-1 text-gray-700">📝 Observaciones:</h3>
                <p className="bg-gray-100 p-3 rounded text-sm text-gray-800">
                  {evaluacion.observaciones || 'Sin observaciones registradas.'}
                </p>
              </div>

              <div className="mt-6 text-sm text-gray-500 text-right">
                Evaluado el:{' '}
                {new Date(evaluacion.fechaRegistro).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Cargando evaluación...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default FaqViewPage;

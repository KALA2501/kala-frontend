import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const DadViewPage = () => {
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
        const res = await axios.get(`${API_GATEWAY}/api/formularios/dad/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvaluacion(res.data);
      } catch (err) {
        console.error('❌ Error al obtener evaluación DAD:', err);
        alert('No se encontró evaluación DAD para este paciente.');
      }
    };
    fetchEvaluacion();
  }, [token, pacienteId]);

  const secciones = [
    ['Higiene Personal', 'HigienePersonal'],
    ['Vestirse', 'Vestirse'],
    ['Alimentación', 'Comer'],
    ['Preparar Comidas', 'PrepararComidas'],
    ['Tareas Domésticas', 'TareasDomesticas'],
    ['Lavado de Ropa', 'LavarRopa'],
    ['Manejo de Medicación', 'Medicacion'],
    ['Manejo de Finanzas', 'ManejarDinero'],
    ['Seguridad / Orientación', 'Orientarse']
  ];

  const renderItem = (label, baseKey) => (
    <div key={baseKey} className="mb-4 bg-gray-50 p-3 rounded shadow-sm">
      <h3 className="font-semibold text-[#30028D] mb-2">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        {['Iniciar', 'Planificar', 'Ejecutar'].map((accion) => {
          const key = `${accion.toLowerCase()}${baseKey}`;
          const valor = evaluacion[key];
          return (
            <div key={key} className="flex justify-between">
              <span>{accion}</span>
              <span className={valor ? 'text-green-600 font-semibold' : 'text-red-500'}>
                {valor ? '✔ Sí' : '✘ No'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-3xl font-bold text-center text-[#30028D] mb-6">Evaluación DAD</h1>

          {evaluacion ? (
            <>
              <p className="text-right text-sm text-gray-500 mb-4">
                Evaluado el:{' '}
                {new Date(evaluacion.fechaRegistro).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>

              {secciones.map(([label, baseKey]) => renderItem(label, baseKey))}

              <div className="mt-6">
                <h3 className="font-semibold mb-1 text-gray-700">📝 Observaciones:</h3>
                <p className="bg-gray-100 p-3 rounded text-sm text-gray-800">
                  {evaluacion.observaciones || 'Sin observaciones registradas.'}
                </p>
              </div>

              <div className="mt-6 text-right text-gray-600 font-medium">
                Nivel de independencia estimado: <span className="text-[#30028D]">{evaluacion.porcentajeIndependencia}%</span>
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

export default DadViewPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const LawtonViewPage = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tkn = await user.getIdToken();
        setToken(tkn);
      } else {
        setError('⚠️ Sesión expirada. Redirigiendo...');
        setTimeout(() => navigate('/login'), 2000);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_GATEWAY}/api/formularios/lawton/${pacienteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError('❌ No se encontró ninguna evaluación para este paciente.');
        } else if (err.response && err.response.status === 403) {
          setError('⛔ No tienes permisos para ver esta evaluación.');
        } else {
          setError('❌ Error al obtener la evaluación.');
        }
      }
    };
    fetchEvaluation();
  }, [pacienteId, token]);

  const booleanToYesNo = (val) => (val ? '✔️ Sí' : '❌ No');

  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!data) return <p className="text-center mt-10">⏳ Cargando evaluación...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl p-10 mt-10 rounded-lg">
      <h1 className="text-4xl font-bold text-center text-[#30028D] mb-6">Evaluación Lawton-Brody</h1>
      <ul className="text-lg space-y-3">
        <li><strong>¿Usa el teléfono?</strong> {booleanToYesNo(data.usoTelefono)}</li>
        <li><strong>¿Hace compras?</strong> {booleanToYesNo(data.hacerCompras)}</li>
        <li><strong>¿Prepara sus comidas?</strong> {booleanToYesNo(data.preparacionComida)}</li>
        <li><strong>¿Cuida su casa?</strong> {booleanToYesNo(data.cuidadoCasa)}</li>
        <li><strong>¿Lava su ropa?</strong> {booleanToYesNo(data.lavadoRopa)}</li>
        <li><strong>¿Utiliza transporte público?</strong> {booleanToYesNo(data.usoTransporte)}</li>
        <li><strong>¿Maneja su medicación?</strong> {booleanToYesNo(data.manejoMedicacion)}</li>
        <li><strong>¿Maneja sus finanzas?</strong> {booleanToYesNo(data.manejoFinanzas)}</li>
        <li><strong>Observaciones:</strong> <span className="italic">{data.observaciones || 'Ninguna'}</span></li>
        <li><strong>Fecha de registro:</strong> {new Date(data.fechaRegistro).toLocaleString('es-CO')}</li>
      </ul>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-[#7358F5] hover:bg-[#30028D] text-white py-2 px-4 rounded-lg"
      >
        Volver
      </button>
    </div>
  );
};

export default LawtonViewPage;

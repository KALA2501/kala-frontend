import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const LawtonReportPage = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [token, setToken] = useState('');
  const [medicoId, setMedicoId] = useState('');

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tkn = await user.getIdToken();
        setToken(tkn);

        const res = await axios.get(
          `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
          { headers: { Authorization: `Bearer ${tkn}` } }
        );
        setMedicoId(res.data.pkId);
      }
    });
  }, []);

  useEffect(() => {
    const fetchPacientesConEvaluacion = async () => {
      if (!token || !medicoId) return;

      const pacientesRes = await axios.get(`${API_GATEWAY}/api/pacientes/del-medico/${medicoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pacientes = pacientesRes.data;

      const pacientesConEvaluacion = await Promise.all(
        pacientes.map(async (p) => {
          try {
            const evalRes = await axios.get(`${API_GATEWAY}/api/formularios/lawton/${p.pkId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const evaluacion = evalRes.data;

            const cumplidos = [
              evaluacion.usoTelefono,
              evaluacion.hacerCompras,
              evaluacion.preparacionComida,
              evaluacion.cuidadoCasa,
              evaluacion.lavadoRopa,
              evaluacion.usoTransporte,
              evaluacion.manejoMedicacion,
              evaluacion.manejoFinanzas
            ].filter(Boolean).length;

            return {
              ...p,
              fechaEvaluacion: evaluacion.fechaRegistro,
              totalCumplidos: cumplidos,
              totalErrores: 8 - cumplidos
            };
          } catch {
            return { ...p, sinEvaluacion: true };
          }
        })
      );

      setPacientes(pacientesConEvaluacion);
    };

    fetchPacientesConEvaluacion();
  }, [token, medicoId]);

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-[#30028D] mb-6 text-center">📋 Reportes Lawton-Brody</h1>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm text-left border">
          <thead className="bg-[#f4f4f4] text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2">Paciente</th>
              <th className="px-4 py-2">Etapa</th>
              <th className="px-4 py-2">Logros</th>
              <th className="px-4 py-2">Errores</th>
              <th className="px-4 py-2">Fecha Evaluación</th>
              <th className="px-4 py-2">Hora</th>
              <th className="px-4 py-2">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.pkId} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 flex items-center space-x-2">
                  <img
                    src={p.urlImagen || 'https://via.placeholder.com/40'}
                    alt="Paciente"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{p.nombre} {p.apellido}</span>
                </td>
                <td className="px-4 py-2">{p.etapa}</td>
                <td className="px-4 py-2">{p.sinEvaluacion ? '-' : p.totalCumplidos}</td>
                <td className="px-4 py-2">{p.sinEvaluacion ? '-' : p.totalErrores}</td>
                <td className="px-4 py-2">
                  {p.fechaEvaluacion
                    ? new Date(p.fechaEvaluacion).toLocaleDateString('es-CO')
                    : 'Sin evaluación'}
                </td>
                <td className="px-4 py-2">
                  {p.fechaEvaluacion
                    ? new Date(p.fechaEvaluacion).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => navigate(`/lawton-view/${p.pkId}`)}
                    className="bg-[#7358F5] hover:bg-[#30028D] text-white px-3 py-1 rounded-md"
                    disabled={p.sinEvaluacion}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LawtonReportPage;

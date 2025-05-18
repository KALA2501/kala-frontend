import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MenuLateralMedico from './components/MenuLateralMedico';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

const API_METRICAS = 'http://localhost:9099/api/metricas';

const DesempenoIndividualPage = () => {
  const [medicoId] = useState('M001');
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [metricas, setMetricas] = useState({});

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await axios.get(`${API_METRICAS}/pacientes-vinculados/${medicoId}`);
        setPacientes(res.data);
        if (res.data.length > 0) {
          setPacienteSeleccionado(res.data[0].paciente_id); // <- clave correcta
        }
      } catch (error) {
        console.error('Error cargando pacientes:', error);
      }
    };

    fetchPacientes();
  }, [medicoId]);

  useEffect(() => {
    if (!pacienteSeleccionado) return;
    const fetchMetricas = async () => {
      try {
        const res = await axios.get(`${API_METRICAS}/paciente/${pacienteSeleccionado}/detalles`);
        setMetricas(res.data);
      } catch (error) {
        console.error('Error cargando métricas individuales:', error);
      }
    };

    fetchMetricas();
  }, [pacienteSeleccionado]);

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <MenuLateralMedico />
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-purple mb-4">Desempeño Individual del Paciente</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un paciente:</label>
          <select
            value={pacienteSeleccionado || ''}
            onChange={(e) => setPacienteSeleccionado(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
          >
            {pacientes.map(p => (
              <option key={p.paciente_id} value={p.paciente_id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Gráfica 1 */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Evolución del Tiempo (Identificación de Dinero)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricas.evolucionTiempo || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="denominacion" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tiempo" stroke="#7358F5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica 2 */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Errores por Denominación</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricas.erroresDenominacion || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="denominacion" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errores" fill="#E08B8B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica 3 */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Actividades</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricas.actividadesHistorial || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cantidad" stroke="#28A745" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica 4 */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Precisión al Devolver Cambio</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricas.precisionCambio || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monto" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="correcto" fill="#FFB347" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DesempenoIndividualPage;

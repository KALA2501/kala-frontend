import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MenuLateralMedico from './components/MenuLateralMedico';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

const API_METRICAS = 'http://localhost:9099/api/metricas';

const normalizeMetricas = (data) => {
  const parseFecha = (f) => new Date(f).toISOString().split('T')[0];

  return {
    historialTiempo: (data.historialTiempo || []).map(d => ({
      fecha: parseFecha(d.fecha),
      tiempo_promedio: parseFloat(d.tiempo_promedio)
    })),
    erroresPorSesion: (data.erroresPorSesion || []).map(d => ({
      fecha: parseFecha(d.fecha),
      errores_totales: parseInt(d.errores_totales)
    })),
    erroresPorCubierto: (data.erroresPorCubierto || []).map(d => ({
      paciente_id: d.paciente_id,
      cuchillo: parseInt(d.cuchillo),
      cuchara: parseInt(d.cuchara),
      tenedor: parseInt(d.tenedor)
    })),
    erroresPorPlato: (data.erroresPorPlato || []).map(d => ({
      paciente_id: d.paciente_id,
      pizza: parseInt(d.pizza),
      sopa: parseInt(d.sopa),
      ramen: parseInt(d.ramen)
    }))
  };
};

const DesempenoIndividualPage = () => {
  const { actividad } = useParams();
  const [medicoId] = useState('M003'); // Más adelante lo extraes del token
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [metricas, setMetricas] = useState({});

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await axios.get(`${API_METRICAS}/pacientes-vinculados/${medicoId}`);
        setPacientes(res.data);
        if (res.data.length > 0) {
          setPacienteSeleccionado(res.data[0].paciente_id);
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
      const endpoint = actividad === 'cajero'
        ? `/paciente/${pacienteSeleccionado}/detalles`
        : actividad === 'mercado'
        ? `/paciente/${pacienteSeleccionado}/mercado-detalles`
        : `/paciente/${pacienteSeleccionado}/cubiertos-detalles`;

      const res = await axios.get(`${API_METRICAS}${endpoint}`);
      if (actividad === 'cubiertos') {
        setMetricas(normalizeMetricas(res.data));
      } else {
        setMetricas(res.data);
      }
    } catch (error) {
      console.error('Error cargando métricas individuales:', error);
    }
  };

  fetchMetricas();
}, [pacienteSeleccionado, actividad]);

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

        {/* === CAJERO === */}
        {actividad === 'cajero' && (
          <>
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
          </>
        )}

        {/* === MERCADO === */}
        {actividad === 'mercado' && (
          <>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Actividades</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas.historialActividades || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" stroke="#28A745" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Evolución del Tiempo Total</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas.evolucionTiempo || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="duracion" stroke="#7358F5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Precisión en Selección de Ítems</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricas.precisionPorSesion || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="correctos" fill="#28A745" />
                  <Bar dataKey="incorrectos" fill="#E08B8B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* === CUBIERTOS === */}
        {actividad === 'cubiertos' && (
          <>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Evolución del Tiempo (Cubiertos)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas.historialTiempo || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tiempo_promedio" stroke="#7358F5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Errores Totales por Día</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas.erroresPorSesion || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="errores_totales" stroke="#E08B8B" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Errores por Cubierto</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricas.erroresPorCubierto ? [metricas.erroresPorCubierto[0]] : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="paciente_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cuchillo" fill="#7358F5" />
                  <Bar dataKey="cuchara" fill="#FFB347" />
                  <Bar dataKey="tenedor" fill="#E08B8B" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Errores por Plato</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricas.erroresPorPlato ? [metricas.erroresPorPlato[0]] : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="paciente_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pizza" fill="#FF6384" />
                  <Bar dataKey="sopa" fill="#7DB9B6" />
                  <Bar dataKey="ramen" fill="#36A2EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {actividad !== 'cajero' && actividad !== 'mercado' && actividad !== 'cubiertos' && (
          <div className="text-center text-gray-600 text-lg mt-10">
            ⚠️ Aún no hay métricas individuales disponibles para esta actividad.
          </div>
        )}
      </div>
    </div>
  );
};

export default DesempenoIndividualPage;

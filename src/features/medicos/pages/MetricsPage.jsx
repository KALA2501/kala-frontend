import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import MenuLateralMedico from './components/MenuLateralMedico';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, ScatterChart, Scatter, Legend
} from 'recharts';

const API_METRICAS = 'http://localhost:9099/api/metricas';

const MetricsPage = () => {
  const { actividad } = useParams(); // cajero, mercado o cubiertos
  const navigate = useNavigate();
  const [medicoId, setMedicoId] = useState('M001');

  const [conteoActividades, setConteoActividades] = useState([]);
  const [tiempoPromedio, setTiempoPromedio] = useState([]);
  const [erroresPromedio, setErroresPromedio] = useState([]);
  const [tiempoVsErrores, setTiempoVsErrores] = useState([]);
  const [erroresDenominacion, setErroresDenominacion] = useState([]);
  const [actividadesErrores, setActividadesErrores] = useState([]);

  const colores = [
    "#A694E0", "#7358F5", "#E08B8B", "#FFB347", "#28A745",
    "#7DB9B6", "#D5718F", "#FF6384", "#36A2EB", "#FFCE56"
  ];

  useEffect(() => {
    if (actividad !== 'cajero' || !medicoId) return;

    const fetchMetrics = async () => {
      try {
        const endpoints = [
          { key: 'conteoActividades', url: `/conteo-actividades/${medicoId}` },
          { key: 'tiempoPromedio', url: `/tiempo-promedio/${medicoId}` },
          { key: 'erroresPromedio', url: `/errores-promedio/${medicoId}` },
          { key: 'tiempoVsErrores', url: `/tiempo-vs-errores/${medicoId}` },
          { key: 'erroresDenominacion', url: `/errores-por-denominacion/${medicoId}` },
          { key: 'actividadesErrores', url: `/actividades-vs-errores/${medicoId}` },
        ];

        for (const ep of endpoints) {
          const res = await axios.get(`${API_METRICAS}${ep.url}`);
          switch (ep.key) {
            case 'conteoActividades':
              setConteoActividades(res.data);
              break;
            case 'tiempoPromedio':
              setTiempoPromedio(res.data);
              break;
            case 'erroresPromedio':
              setErroresPromedio(res.data);
              break;
            case 'tiempoVsErrores':
              setTiempoVsErrores(res.data);
              break;
            case 'erroresDenominacion':
              setErroresDenominacion(res.data);
              break;
            case 'actividadesErrores':
              setActividadesErrores(res.data);
              break;
            default:
              break;
          }
        }
      } catch (err) {
        console.error('❌ Error al cargar métricas:', err);
      }
    };

    fetchMetrics();
  }, [actividad, medicoId]);

  const agruparErroresPorDenominacion = () => {
    const agrupado = {};
    erroresDenominacion.forEach((item) => {
      const denom = item.denominacion;
      const nombre = item.nombre_paciente || item.paciente_id;
      if (!agrupado[denom]) agrupado[denom] = { denominacion: denom };
      agrupado[denom][nombre] = item.promedio_errores;
    });
    return Object.values(agrupado);
  };

  const pacientesUnicos = [...new Set(
    erroresDenominacion.map(e => e.nombre_paciente || e.paciente_id)
  )];

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <MenuLateralMedico />
      <div className="flex-1 p-8">
        {actividad !== 'cajero' ? (
          <div className="text-center mt-10 text-gray-600 text-xl">
            ⚠️ Por ahora solo se encuentran disponibles las métricas de la actividad <strong>Cajero</strong>.
          </div>
        ) : (
          <>
            {/* Título y botón */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-purple">Métricas Cognitivas - Cajero</h1>
              <button
                onClick={() => navigate('/metrics/cajero/desempeno-individual')}
                className="bg-purple text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
              >
                Ver Desempeño Individual
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Estas métricas corresponden exclusivamente a la <strong>actividad de cajero</strong>,
              basada en el desempeño de tus pacientes vinculados.
            </p>

            {/* Campo de ID del médico */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID del Médico:</label>
              <input
                type="text"
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
                placeholder="Ej: M001"
              />
            </div>

            <MetricChart title="Actividades Realizadas por Paciente" data={conteoActividades} dataKey="total_actividades" fill="#A694E0" />
            <MetricChart title="Tiempo Promedio por Paciente" data={tiempoPromedio} dataKey="tiempo_promedio" fill="#7358F5" />
            <MetricChart title="Errores Promedio por Paciente" data={erroresPromedio} dataKey="errores_promedio" fill="#E08B8B" />

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparación Tiempo vs Errores</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="promedio_tiempo" name="Tiempo" />
                  <YAxis type="number" dataKey="promedio_errores" name="Errores" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={tiempoVsErrores} fill="#28A745" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Errores por Denominación (por Paciente)</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agruparErroresPorDenominacion()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="denominacion" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {pacientesUnicos.map((paciente, index) => (
                    <Bar
                      key={paciente}
                      dataKey={paciente}
                      stackId="a"
                      fill={colores[index % colores.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividades vs Errores Totales</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={actividadesErrores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_actividades" fill="#7DB9B6" />
                  <Bar dataKey="total_errores" fill="#D5718F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsPage;

// Componente reutilizable para gráficas simples
const MetricChart = ({ title, data, dataKey, fill }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

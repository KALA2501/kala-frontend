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
  const [medicoId, setMedicoId] = useState('M003');

  // Cajero
  const [conteoActividades, setConteoActividades] = useState([]);
  const [tiempoPromedio, setTiempoPromedio] = useState([]);
  const [erroresPromedio, setErroresPromedio] = useState([]);
  const [tiempoVsErrores, setTiempoVsErrores] = useState([]);
  const [erroresDenominacion, setErroresDenominacion] = useState([]);
  const [actividadesErrores, setActividadesErrores] = useState([]);

  // Mercado
  const [duracionPromedio, setDuracionPromedio] = useState([]);
  const [consultasLista, setConsultasLista] = useState([]);
  const [precisionItems, setPrecisionItems] = useState([]);
  const [erroresCantidad, setErroresCantidad] = useState([]);
  const [tiempoLista, setTiempoLista] = useState([]);

  const colores = [
    "#A694E0", "#7358F5", "#E08B8B", "#FFB347", "#28A745",
    "#7DB9B6", "#D5718F", "#FF6384", "#36A2EB", "#FFCE56"
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        let endpoints = [];

        if (actividad === 'cajero') {
          endpoints = [
            { key: 'conteoActividades', url: `/conteo-actividades/${medicoId}` },
            { key: 'tiempoPromedio', url: `/tiempo-promedio/${medicoId}` },
            { key: 'erroresPromedio', url: `/errores-promedio/${medicoId}` },
            { key: 'tiempoVsErrores', url: `/tiempo-vs-errores/${medicoId}` },
            { key: 'erroresDenominacion', url: `/errores-por-denominacion/${medicoId}` },
            { key: 'actividadesErrores', url: `/actividades-vs-errores/${medicoId}` }
          ];
        } else if (actividad === 'mercado') {
          endpoints = [
            { key: 'duracionPromedio', url: `/mercado/duracion-promedio/${medicoId}` },
            { key: 'consultasLista', url: `/mercado/consultas-lista/${medicoId}` },
            { key: 'precisionItems', url: `/mercado/precision-items/${medicoId}` },
            { key: 'erroresCantidad', url: `/mercado/errores-cantidad/${medicoId}` },
            { key: 'tiempoLista', url: `/mercado/tiempo-lista/${medicoId}` }
          ];
        }

        for (const ep of endpoints) {
          const res = await axios.get(`${API_METRICAS}${ep.url}`);
          switch (ep.key) {
            case 'conteoActividades': setConteoActividades(res.data); break;
            case 'tiempoPromedio': setTiempoPromedio(res.data); break;
            case 'erroresPromedio': setErroresPromedio(res.data); break;
            case 'tiempoVsErrores': setTiempoVsErrores(res.data); break;
            case 'erroresDenominacion': setErroresDenominacion(res.data); break;
            case 'actividadesErrores': setActividadesErrores(res.data); break;
            case 'duracionPromedio': setDuracionPromedio(res.data); break;
            case 'consultasLista': setConsultasLista(res.data); break;
            case 'precisionItems': setPrecisionItems(res.data); break;
            case 'erroresCantidad': setErroresCantidad(res.data); break;
            case 'tiempoLista': setTiempoLista(res.data); break;
            default: break;
          }
        }
      } catch (err) {
        console.error(`❌ Error al cargar métricas ${actividad}:`, err);
      }
    };

    if (medicoId) fetchMetrics();
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
        {actividad === 'cajero' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-purple">Métricas Cognitivas - Mi tienda</h1>
              <button onClick={() => navigate('/metrics/cajero/desempeno-individual')} className="bg-purple text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition">Ver Desempeño Individual</button>
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
                    <Bar key={paciente} dataKey={paciente} stackId="a" fill={colores[index % colores.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <MetricChart title="Actividades vs Errores Totales" data={actividadesErrores} dataKey="total_errores" fill="#D5718F" />
          </>
        )}

        {actividad === 'mercado' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-purple">Métricas Cognitivas - Ir de Compras</h1>
              <button onClick={() => navigate('/metrics/mercado/desempeno-individual')} className="bg-purple text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition">Ver Desempeño Individual</button>
            </div>
            <MetricChart title="Duración Promedio de la Actividad" data={duracionPromedio} dataKey="duracion_promedio" fill="#A694E0" />
            <MetricChart title="Consultas Promedio a la Lista" data={consultasLista} dataKey="promedio_consultas_lista" fill="#7358F5" />
            <MetricChart title="Tiempo Promedio Mirando la Lista" data={tiempoLista} dataKey="tiempo_promedio_lista" fill="#FFB347" />

            <MetricChart title="Precisión en Selección de Ítems (Correctos)" data={precisionItems} dataKey="total_correctos" fill="#28A745" />
            <MetricChart title="Precisión en Selección de Ítems (Incorrectos)" data={precisionItems} dataKey="total_incorrectos" fill="#E08B8B" />

            <MetricChart title="Promedio Desviación en Cantidad" data={erroresCantidad} dataKey="promedio_desviacion" fill="#FF6384" />
            <MetricChart title="Cantidad Incorrecta Promedio" data={erroresCantidad} dataKey="cantidad_incorrecta_prom" fill="#36A2EB" />
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsPage;

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

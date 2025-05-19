import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuLateralMedico from './components/MenuLateralMedico';

const SeleccionActividadPage = () => {
  const navigate = useNavigate();

  const handleSeleccion = (actividad) => {
    navigate(`/metrics/${actividad}`);
  };

  const actividades = [
    {
      id: 'cajero',
      nombre: 'Mi Tienda',
      icono: '🏦',
      bg: 'bg-[#A694E0]',
      hover: 'hover:bg-[#8269d0]',
    },
    {
      id: 'mercado',
      nombre: 'Ir de Compras',
      icono: '🛒',
      bg: 'bg-[#FFB347]',
      hover: 'hover:bg-[#e09b2f]',
    },
    {
      id: 'cubiertos',
      nombre: 'Hora de Comer',
      icono: '🍴',
      bg: 'bg-[#28A745]',
      hover: 'hover:bg-[#1e7e34]',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <MenuLateralMedico />
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold text-purple mb-4">Métricas Cognitivas</h1>
        <p className="text-gray-700 mb-8 text-lg">
          Selecciona la <strong>actividad</strong> sobre la cual deseas visualizar las métricas de tus pacientes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actividades.map((act) => (
            <button
              key={act.id}
              onClick={() => handleSeleccion(act.id)}
              className={`${act.bg} ${act.hover} text-white py-6 px-4 rounded-2xl shadow text-xl font-semibold transition-all duration-300 transform hover:scale-[1.03]`}
            >
              <span className="text-3xl mr-2">{act.icono}</span> {act.nombre}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SeleccionActividadPage;

// src/features/medicos/pages/MetricsPage.jsx
import React from 'react';
import MenuLateralMedico from './components/MenuLateralMedico';
import { FaExternalLinkAlt } from 'react-icons/fa';

const MetricsPage = () => {
  const dashboardUrl =
    'https://public.tableau.com/views/DashboardIdentificacindeDinero/Dashboard1?:embed=yes';

  const handleOpenDashboard = () => {
    window.open(dashboardUrl, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      {/* Menú lateral */}
      <MenuLateralMedico />

      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-purple mb-6">Métricas Cognitivas</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-purple-100">
          <p className="text-gray-700 mb-4">
            Visualiza el rendimiento cognitivo de tus pacientes en las actividades de identificación de dinero.
          </p>

          <button
            onClick={handleOpenDashboard}
            className="flex items-center gap-2 bg-purple text-white px-5 py-2 rounded-xl font-medium hover:bg-[#8269d0] transition"
          >
            Ver Dashboard en Tableau <FaExternalLinkAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;

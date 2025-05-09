import React from 'react';

const PacientesActividades = () => {
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-[#30028D] mb-4">Juego de Cubiertos</h1>
      
      <iframe
        src="http://localhost:9094/Cubiertos"
        title="Juego Cubiertos"
        width="1000"
        height="600"
        frameBorder="0"
        allowFullScreen
        className="shadow-xl border border-gray-300"
      />
    </div>
  );
};

export default PacientesActividades;

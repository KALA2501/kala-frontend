import React from 'react';

const JuegoCubiertosPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-purple mb-6">Hora de Comer 🥄</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Instrucciones:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Identifica correctamente los cubiertos según su forma y uso.</li>
          <li>Evita errores para ganar más puntos.</li>
          <li>¡Mientras más rápido, mejor!</li>
        </ul>
      </div>

      <iframe
        src="http://localhost:9094/games/cubiertos/"
        title="Juego Cubiertos"
        className="w-[90%] h-[70vh] border-2 border-purple rounded-xl shadow-lg"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default JuegoCubiertosPage;

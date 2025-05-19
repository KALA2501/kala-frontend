import React from 'react';

const JuegoCajeroPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-purple mb-6">Mi Cajero 🏧</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Instrucciones:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Organiza y entrega el dinero correctamente según lo que te pida el cliente.</li>
          <li>Evita entregar de más o de menos.</li>
          <li>Hazlo lo más rápido posible para ganar más puntos.</li>
          <li>Concentra tu atención en billetes y monedas, y trata de minimizar los errores.</li>
        </ul>
      </div>

      <iframe
        src="http://localhost:9094/games/Cajero/"
        title="Juego Cajero"
        className="w-[90%] h-[70vh] border-2 border-purple rounded-2xl shadow-lg"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default JuegoCajeroPage;

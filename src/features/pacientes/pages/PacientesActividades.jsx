import React from 'react';
import { useNavigate } from 'react-router-dom';

const juegos = [
  { nombre: 'Hora de Comer', path: 'cubiertos', emoji: '🥄' },
  { nombre: 'Mi Cajero', path: 'cajero', emoji: '🏧' },
  { nombre: 'Mi Tienda', path: 'mercado', emoji: '🛒' }
];

const PacientesActividades = () => {
  const navigate = useNavigate();

  const irAlJuego = (path) => {
    navigate(`/jugar/${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-purple mb-10">
        Actividades Interactivas 🧠
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">
        {juegos.map((juego) => (
          <button
            key={juego.path}
            onClick={() => irAlJuego(juego.path)}
            className="bg-white border-2 border-purple p-6 rounded-2xl shadow-md hover:scale-105 hover:bg-purple/10 transition duration-300 text-center text-xl font-semibold"
          >
            <span className="text-4xl block mb-2">{juego.emoji}</span>
            {juego.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PacientesActividades;

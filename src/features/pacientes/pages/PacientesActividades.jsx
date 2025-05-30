import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;
const GAME_SERVER = process.env.REACT_APP_GAME_SERVER;

const juegos = [
  { nombre: 'Hora de Comer', path: 'cubiertos', emoji: '🥄' },
  { nombre: 'Mi Cajero', path: 'cajero', emoji: '🏧' },
  { nombre: 'Mi Tienda', path: 'mercado', emoji: '🛒' }
];

const PacientesActividades = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [gameUrl, setGameUrl] = useState(null); // URL to embed in iframe

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();

          if (!token || token.split('.').length !== 3) {
            throw new Error("Token JWT inválido o malformado");
          }

          const idRes = await axios.get(
            `${API_GATEWAY}/api/pacientes/mi-perfil`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setUserId(idRes.data);
        } catch (err) {
          console.error("Error fetching patient ID:", err);
        }
      } else {
        console.warn("Usuario no autenticado");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const irAlJuego = (path) => {
    if (!userId) {
      console.error("No se ha cargado el ID del paciente.");
      return;
    }

    if (!GAME_SERVER) {
      console.error("⚠️ GAME_SERVER no está definido. Verifica tu archivo .env.");
      return;
    }

    const socket = new WebSocket(`ws://${GAME_SERVER.replace(/^https?:\/\//, '')}/?userId=${userId}`);

    socket.onopen = () => {
      console.log("✅ WebSocket conectado. Enviando juego a Kafka...");
      socket.send(JSON.stringify({ userId, game: path }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'session-start' && data.game === path) {
        console.log("🎮 Kafka confirmó el juego. Cargando Unity...");
        const url = `http://${GAME_SERVER}/games/${data.game}/index.html?userId=${userId}`;
        setGameUrl(url);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket cerrado");
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-purple mb-8">
        Actividades Interactivas 🧠
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
        {juegos.map((juego) => (
          <button
            key={juego.path}
            onClick={() => irAlJuego(juego.path)}
            className="bg-white border-2 border-purple p-6 rounded-2xl shadow-md hover:scale-105 hover:bg-purple/10 transition duration-300 text-center text-xl font-semibold"
            disabled={!userId}
          >
            <span className="text-4xl block mb-2">{juego.emoji}</span>
            {juego.nombre}
          </button>
        ))}
      </div>

      {/* Iframe for Unity Game */}
      {gameUrl && (
        <div className="relative w-full max-w-screen-2xl aspect-[16/10]">
          <iframe
            src={gameUrl}
            title="Juego Unity"
            className="absolute top-0 left-0 w-full h-full rounded-xl border-4 border-purple shadow-2xl"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default PacientesActividades;

// features/home/pages/HeroSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/LogoKala.png'; // Asegúrate de tener tu logo aquí

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center text-center bg-[#F5EE97] py-16 px-4">
            <img src={logo} alt="KALA Logo" className="w-40 h-40 mb-6" />
            <h1 className="text-5xl font-bold text-[#30028D]">Bienvenido a KALA</h1>
            <p className="mt-4 text-lg text-gray-700 max-w-xl">
                Plataforma para la gestión de actividades cognitivas y terapias para adultos mayores.
            </p>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
                <button
                    onClick={() => navigate('/login')}
                    className="bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                    Iniciar Sesión
                </button>
                <a
                    href="#formulario"
                    className="bg-white border-2 border-[#7358F5] text-[#7358F5] hover:bg-[#7358F5] hover:text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                    Registrarme como Centro Médico
                </a>
            </div>
        </div>
    );
};

export default HeroSection;

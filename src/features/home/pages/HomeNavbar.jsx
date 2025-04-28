import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoKala from '../../../assets/LogoKala.png'; // Ajusta la ruta si es necesario

// Si tienes SVGs de iconos importalos aquí (puedes usar imágenes o íconos de librerías también)

const HomeNavbar = () => {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="flex items-center justify-between px-8 py-4 shadow-md bg-white sticky top-0 z-50">
            {/* Logo + Nombre */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
                <img src={logoKala} alt="KALA Logo" className="h-10" />
                <span className="text-2xl font-bold text-[#30028D]">KALA</span>
            </div>

            {/* Navegación */}
            <nav className="flex items-center gap-8 text-[#7358F5] text-lg font-semibold">
                <button onClick={() => scrollToSection('hero')} className="hover:text-[#30028D] transition">
                    Inicio
                </button>
                <button onClick={() => scrollToSection('about')} className="hover:text-[#30028D] transition">
                    ¿Qué es KALA?
                </button>
                <button onClick={() => scrollToSection('benefits')} className="hover:text-[#30028D] transition">
                    Beneficios
                </button>
                <button onClick={() => scrollToSection('formulario')} className="hover:text-[#30028D] transition">
                    Registro
                </button>
                <button onClick={() => navigate('/login')} className="hover:text-[#30028D] transition">
                    Login
                </button>
            </nav>
        </header>
    );
};

export default HomeNavbar;

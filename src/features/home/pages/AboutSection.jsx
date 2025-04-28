// features/home/pages/AboutSection.jsx
import React from 'react';
import abeja1 from '../../../assets/AbejaFondo.png';

const AboutSection = () => {
    return (
        <section id="about" className="bg-white py-16 px-4 flex flex-col items-center">
            <div className="max-w-4xl text-center">
                <h2 className="text-4xl font-bold text-[#30028D] mb-6">¿Qué es KALA?</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                    KALA es una plataforma diseñada para impulsar la salud cognitiva y emocional de los adultos mayores.
                    Integramos actividades terapéuticas innovadoras, seguimiento clínico y herramientas de acompañamiento,
                    en colaboración con centros médicos aliados, para mejorar la calidad de vida de nuestros usuarios.
                </p>
            </div>
            <div className="mt-10">
                <img src={abeja1} alt="Abeja KALA" className="w-48 h-48 object-cover rounded-full shadow-lg" />
            </div>
        </section>
    );
};

export default AboutSection;

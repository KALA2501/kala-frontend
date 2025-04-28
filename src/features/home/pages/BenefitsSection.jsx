// features/home/pages/BenefitsSection.jsx
import React from 'react';

const benefits = [
    {
        title: "Actividades Terapéuticas",
        description: "Ejercicios cognitivos basados en evidencia científica para estimular la mente de los adultos mayores."
    },
    {
        title: "Gestión Personalizada",
        description: "Plataforma de seguimiento clínico para gestionar pacientes y monitorear su progreso de forma eficiente."
    },
    {
        title: "Accesibilidad y Tecnología",
        description: "Herramientas digitales diseñadas pensando en la facilidad de uso para usuarios y centros médicos."
    }
];

const BenefitsSection = () => {
    return (
        <section id="benefits" className="bg-[#F9CFA7] py-16 px-4"> {/* Agrega id="benefits" aquí */}
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-[#30028D] mb-10">¿Por qué elegir KALA?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:scale-105 transition">
                            <h3 className="text-2xl font-semibold text-[#7358F5] mb-4">{benefit.title}</h3>
                            <p className="text-gray-700">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;

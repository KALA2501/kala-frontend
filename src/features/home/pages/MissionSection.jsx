// features/home/pages/MissionSection.jsx
import React from 'react';
import abeja2 from '../../../assets/AbejaConMorado.png'; // O la imagen que prefieras

const MissionSection = () => {
    return (
        <section className="bg-[#7358F5] text-white py-16 px-4 flex flex-col items-center">
            <div className="max-w-4xl text-center">
                <h2 className="text-4xl font-bold mb-6">Nuestra Misión</h2>
                <p className="text-lg leading-relaxed">
                    Nuestra misión es transformar el cuidado de la salud cognitiva, promoviendo el bienestar, la autonomía
                    y la esperanza para los adultos mayores, combinando innovación, empatía y tecnología en un entorno accesible
                    para todos.
                </p>
            </div>
            <div className="mt-10">
                <img src={abeja2} alt="Misión de KALA" className="w-48 h-48 object-cover rounded-full shadow-lg" />
            </div>
        </section>
    );
};

export default MissionSection;

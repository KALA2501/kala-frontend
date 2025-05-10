import React from 'react';
import { FaBrain, FaHeart, FaHandsHelping } from 'react-icons/fa';
import abeja1 from '../../../assets/AbejaFondo.png';
import { useInView } from 'react-intersection-observer';

const AboutSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Solo una vez
    threshold: 0.3,     // 30% del componente visible
  });

  return (
    <section id="about" className="bg-offWhite py-20 px-4" ref={ref}>
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Imagen decorativa */}
        <div className="flex-1 flex justify-center">
          <div className="w-80 h-80 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
            <img
              src={abeja1}
              alt="Abeja KALA"
              className={`w-full h-full object-contain p-4 opacity-70 transition-all duration-1000 ${
                inView ? 'animate-fadeInBlur' : 'opacity-0'
              }`}
            />
          </div>
        </div>

        {/* Contenido de la misión */}
        <div className="flex-1">
          <span className="text-purple font-semibold text-lg block mb-2">Nuestra Misión</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A0A23] mb-6 leading-tight">
            Transformar el cuidado del Alzheimer <br />
            con tecnología accesible
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            En <strong>KALA</strong>, creemos que la tecnología puede ser una poderosa aliada en el cuidado de personas con Alzheimer. Nuestra misión es proporcionar herramientas innovadoras que:
          </p>

          <ul className="space-y-4 text-gray-800">
            <li className="flex items-start gap-4">
              <FaBrain className="text-purple w-6 h-6 mt-1" />
              <span>Estimulen las funciones cognitivas y retrasen el avance de la enfermedad</span>
            </li>
            <li className="flex items-start gap-4">
              <FaHeart className="text-purple w-6 h-6 mt-1" />
              <span>Mejoren la calidad de vida y promuevan la independencia</span>
            </li>
            <li className="flex items-start gap-4">
              <FaHandsHelping className="text-purple w-6 h-6 mt-1" />
              <span>Apoyen a los cuidadores y reduzcan su carga emocional</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

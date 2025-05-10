import React, { useEffect, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import {
  FaBrain,
  FaUserMd,
  FaLaptopMedical,
  FaHandsHelping,
} from 'react-icons/fa';

const benefits = [
  {
    title: 'Actividades Terapéuticas',
    description:
      'Ejercicios cognitivos basados en evidencia científica para estimular la mente de los adultos mayores.',
    icon: <FaBrain />,
  },
  {
    title: 'Gestión Personalizada',
    description:
      'Plataforma de seguimiento clínico para gestionar pacientes y monitorear su progreso de forma eficiente.',
    icon: <FaUserMd />,
  },
  {
    title: 'Accesibilidad y Tecnología',
    description:
      'Herramientas digitales diseñadas pensando en la facilidad de uso para usuarios y centros médicos.',
    icon: <FaLaptopMedical />,
  },
  {
    title: 'Soporte Humano',
    description:
      'Acompañamiento constante de profesionales capacitados para responder dudas y brindar apoyo emocional.',
    icon: <FaHandsHelping />,
  },
];

const BenefitsSection = () => {
  const [centerSlide, setCenterSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1, spacing: 16 },
    breakpoints: {
      '(min-width: 768px)': {
        slides: { perView: 2, spacing: 24 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 3, spacing: 32 },
      },
    },
    slideChanged(slider) {
      updateCenter(slider);
    },
    created(slider) {
      updateCenter(slider);
    },
  });

  // Calcular el índice del slide visible en el centro
  const updateCenter = (slider) => {
    const visible = slider.options.slides.perView ?? 1;
    const middle = Math.floor(visible / 2);
    let calculatedIndex = slider.track.details.rel + middle;
    if (calculatedIndex >= benefits.length) {
      calculatedIndex = 0; // prevenir que quede sin enfocar
    }
    setCenterSlide(calculatedIndex);
  };

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 3000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <section id="benefits" className="bg-peach py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-purple mb-12 text-center">
          ¿Por qué elegir KALA?
        </h2>

        <div
          ref={sliderRef}
          className="keen-slider flex items-center perspective-[1200px]"
        >
          {benefits.map((benefit, index) => {
            const isCenter = index === centerSlide;
            return (
              <div
                key={index}
                className={`keen-slider__slide px-4 transition-all duration-700 flex justify-center ${
                  isCenter
                    ? 'scale-[1.15] z-20'
                    : 'scale-[0.9] opacity-60 blur-[1px] z-10'
                }`}
              >
                <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl p-8 text-center w-full max-w-sm transform-gpu">
                  <div
                    className={`text-purple mb-4 flex justify-center text-4xl ${
                      isCenter ? 'drop-shadow-md' : ''
                    }`}
                  >
                    {benefit.icon}
                  </div>
                  <h3
                    className={`font-semibold mb-2 ${
                      isCenter
                        ? 'text-purple text-xl md:text-2xl'
                        : 'text-purple/80 text-lg md:text-xl'
                    }`}
                  >
                    {benefit.title}
                  </h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

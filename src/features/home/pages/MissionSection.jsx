import React from 'react';
import { useInView } from 'react-intersection-observer';
import Lottie from 'lottie-react';
import beeAnimation from '../../../assets/animations/beeAnimation.json';

const MissionSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="bg-purple text-white py-20 px-4">
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Texto */}
        <div className="flex-1 text-left">
          <span className="text-peach text-sm uppercase tracking-wide font-medium mb-2 block">
            Una visión con propósito
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Cuidar la mente, <br /> honrar la vida
          </h2>
          <p className="text-lg text-offWhite leading-relaxed">
            En <strong>KALA</strong>, creemos en un futuro donde los adultos mayores se sientan acompañados,
            comprendidos y empoderados. Combinamos tecnología, empatía e innovación para brindar soluciones
            que inspiren autonomía, bienestar y esperanza.
          </p>
        </div>

        {/* Animación alineada y grande */}
        <div className="flex-1 flex justify-center mt-12 md:mt-20">
          {inView && (
            <Lottie
              animationData={beeAnimation}
              loop={true}
              className="w-[350px] h-[350px] md:w-[420px] md:h-[420px] scale-110"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;

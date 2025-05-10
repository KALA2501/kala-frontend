import { Link } from "react-router-dom";
import { Button } from "../../../../ui/botton";
import heroVideo from "../../../../assets/videos/hero_video.mp4";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-purple to-purple/70 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Texto */}
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Apoyo innovador para pacientes con Alzheimer
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              KALA es un sistema integral diseñado para mejorar la calidad de vida de pacientes con Alzheimer y apoyar a sus cuidadores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-peach hover:bg-peach/90 text-purple font-bold"
                onClick={() => window.location.href = "/registro"}
              >
                Comenzar ahora
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = "/que-es-kala"}
              >
                Conocer más
              </Button>
            </div>
          </div>

          {/* Video */}
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-full border-8 border-peach shadow-xl">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-full"
              >
                <source src={heroVideo} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
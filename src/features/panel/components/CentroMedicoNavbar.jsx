import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoKala from '../../../assets/LogoKala.png';

const CentroMedicoNavbar = ({ nombreCentro, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center bg-white px-8 py-6 shadow-md">
      <div className="flex items-center gap-5">
        <img
          src={logoKala}
          alt="Logo Kala"
          className="w-14 h-14 object-contain cursor-pointer"
          onClick={() => navigate('/')}
        />
        <div>
          <h1 className="text-3xl font-extrabold text-[#30028D] leading-tight">
            Centro Médico
          </h1>
          <p className="text-lg text-[#666666] font-medium">{nombreCentro}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="bg-[#30028D] hover:bg-[#4B3C9E] text-white text-lg font-semibold py-2 px-6 rounded-xl shadow-md transition-all duration-200"
      >
        Cerrar sesión
      </button>
    </header>
  );
};

export default CentroMedicoNavbar;

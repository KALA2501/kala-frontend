import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/LogoKala.png';

const CentroMedicoNavbar = ({ nombreCentro = "Centro Médico", onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white shadow-md py-6 px-10 flex items-center justify-between border-b border-gray-200">
      {/* Logo y Nombre */}
      <div className="flex items-center space-x-5">
        <img
          src={logo}
          alt="Logo KALA"
          className="w-16 h-16 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <div>
          <h1 className="text-4xl font-extrabold text-[#30028D] leading-tight">
            Panel de Admin 
          </h1>
          <p className="text-lg text-[#666666] font-medium">{nombreCentro}</p>
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <button
        onClick={onLogout}
        className="bg-[#30028D] hover:bg-[#23046d] text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200"
      >
        Cerrar sesión
      </button>
    </nav>
  );
};

export default CentroMedicoNavbar;

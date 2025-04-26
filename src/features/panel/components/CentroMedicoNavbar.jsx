import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoKala from '../../../assets/LogoKala.png';

const CentroMedicoNavbar = ({ nombreCentro, onLogout }) => {
    const navigate = useNavigate();

    return (
        <header className="flex justify-between items-center bg-white px-8 py-4 shadow-md">
            <div className="flex items-center gap-4">
                <img
                    src={logoKala}
                    alt="Logo Kala"
                    className="w-12 h-12 object-contain cursor-pointer"
                    onClick={() => navigate('/')}
                />
                <div>
                    <h1 className="text-xl font-bold text-[#30028D]">Centro Médico</h1>
                    <p className="text-sm text-gray-600">{nombreCentro}</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="bg-[#7358F5] hover:bg-[#30028D] text-white py-2 px-4 rounded-lg transition"
            >
                Cerrar sesión
            </button>
        </header>
    );
};

export default CentroMedicoNavbar;

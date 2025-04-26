// src/features/admin/components/AdminNavbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/LogoKala.png'; // Ajusta si tu logo está en otro sitio

const AdminNavbar = ({ adminEmail, onLogout }) => {
    const navigate = useNavigate();

    return (
        <nav className="flex items-center justify-between bg-white py-4 px-6 shadow-md">
            <div className="flex items-center space-x-4">
                <img
                    src={logo}
                    alt="Logo KALA"
                    className="w-12 h-12 cursor-pointer"
                    onClick={() => navigate('/')}
                />
                <div>
                    <h1 className="text-2xl font-bold text-[#30028D]">Panel de Administración</h1>
                    <p className="text-sm text-gray-600">{adminEmail}</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-2 px-4 rounded-lg transition"
            >
                Cerrar sesión
            </button>
        </nav>
    );
};

export default AdminNavbar;

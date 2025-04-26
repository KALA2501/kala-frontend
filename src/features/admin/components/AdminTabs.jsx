// src/features/admin/components/AdminTabs.jsx
import React from 'react';

const AdminTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex justify-center gap-4 mt-8">
            <button
                onClick={() => setActiveTab('usuarios')}
                className={`py-2 px-6 rounded-lg font-semibold transition ${activeTab === 'usuarios'
                        ? 'bg-[#7358F5] text-white'
                        : 'bg-white text-[#30028D] border border-[#7358F5]'
                    }`}
            >
                Usuarios
            </button>

            <button
                onClick={() => setActiveTab('solicitudes')}
                className={`py-2 px-6 rounded-lg font-semibold transition ${activeTab === 'solicitudes'
                        ? 'bg-[#7358F5] text-white'
                        : 'bg-white text-[#30028D] border border-[#7358F5]'
                    }`}
            >
                Solicitudes
            </button>
        </div>
    );
};

export default AdminTabs;

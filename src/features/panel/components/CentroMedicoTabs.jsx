import React from 'react';

const CentroMedicoTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex justify-center gap-4 mt-8">
            <button
                onClick={() => setActiveTab('medicos')}
                className={`py-2 px-6 rounded-lg font-semibold transition ${activeTab === 'medicos'
                        ? 'bg-[#7358F5] text-white'
                        : 'bg-white text-[#30028D] border border-[#7358F5]'
                    }`}
            >
                Médicos
            </button>

            <button
                onClick={() => setActiveTab('pacientes')}
                className={`py-2 px-6 rounded-lg font-semibold transition ${activeTab === 'pacientes'
                        ? 'bg-[#7358F5] text-white'
                        : 'bg-white text-[#30028D] border border-[#7358F5]'
                    }`}
            >
                Pacientes
            </button>
        </div>
    );
};

export default CentroMedicoTabs;

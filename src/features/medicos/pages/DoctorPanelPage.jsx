import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorPanelPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Bienvenido al panel del médico</h1>
            <button
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
                onClick={() => navigate('/register-patient')}
            >
                Agregar Paciente
            </button>
        </div>
    );
};

export default DoctorPanelPage;

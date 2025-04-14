import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorPanelPage = () => {
    const [medico, setMedico] = useState(null);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                const correo = user.email;
                try {
                    const medicoRes = await axios.get(
                        `http://localhost:8080/api/medicos/buscar-por-correo?correo=${encodeURIComponent(correo)}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setMedico(medicoRes.data);

                    const pacientesRes = await axios.get(
                        `http://localhost:8080/api/pacientes/medico/${medicoRes.data.pkId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setPacientes(pacientesRes.data);
                } catch (error) {
                    console.error('Error al obtener datos del médico:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1>Bienvenido, Dr. {medico?.nombre} {medico?.apellido}</h1>
            {medico?.urlImagen && (
                <img
                    src={medico.urlImagen}
                    alt="Foto del médico"
                    style={{ maxWidth: '150px', borderRadius: '8px', boxShadow: '0 0 8px rgba(0,0,0,0.2)', marginBottom: '1rem' }}
                />
            )}

            <h2>Pacientes asignados</h2>
            {pacientes.length === 0 ? (
                <p>No tienes pacientes asignados aún.</p>
            ) : (
                <ul>
                    {pacientes.map((p) => (
                        <li key={p.pkId}>{p.nombre} {p.apellido} - {p.idDocumento}</li>
                    ))}
                </ul>
            )}

            <button
                onClick={() => navigate('/medico/agregar-paciente')}
                style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
                Agregar paciente
            </button>
        </div>
    );
};

export default DoctorPanelPage;

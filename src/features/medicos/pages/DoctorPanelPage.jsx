import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const DoctorPanelPage = () => {
    const navigate = useNavigate();
    const [doctorImage, setDoctorImage] = useState('');
    const [pacientes, setPacientes] = useState([]);
    const [medicoId, setMedicoId] = useState('');
    const [medico, setMedico] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken();

                    // Obtener los datos del médico por correo
                    const resMedico = await axios.get(
                        `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const doctorData = resMedico.data;
                    setDoctorImage(doctorData.urlImagen);
                    setMedicoId(doctorData.pkId);
                    setMedico(doctorData);

                    // Obtener pacientes vinculados a este médico
                    const resPacientes = await axios.get(
                        `${API_GATEWAY}/api/pacientes/del-medico`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setPacientes(resPacientes.data);
                    setMensaje('');
                } catch (err) {
                    console.error('❌ Error durante la carga inicial:', err);
                    setMensaje("❌ Error al cargar los datos. Verifica que el médico tenga pacientes vinculados.");
                } finally {
                    setLoading(false);
                }
            } else {
                setMensaje("⚠️ Usuario no autenticado");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (pacienteId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta vinculación?")) return;

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            await axios.delete(`${API_GATEWAY}/api/vinculacion?pacienteId=${pacienteId}&medicoId=${medicoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setPacientes(prev => prev.filter(p => p.pkId !== pacienteId));
            alert("✅ Vinculación eliminada");
        } catch (err) {
            console.error("❌ Error al eliminar vinculación:", err.response || err);
            alert("❌ Error al eliminar vinculación");
        }
    };

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Bienvenido al panel del médico</h1>

            {doctorImage && (
                <img src={doctorImage} alt="Doctor" style={{ width: '150px', borderRadius: '50%', marginTop: '1rem' }} />
            )}

            <button
                onClick={() => navigate('/register-patient', { state: { medico } })}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
            >
                Agregar Paciente
            </button>

            <h2 style={{ marginTop: '2rem' }}>Lista de Pacientes</h2>

            {loading ? (
                <p>Cargando pacientes...</p>
            ) : mensaje ? (
                <p style={{ color: 'red' }}>{mensaje}</p>
            ) : pacientes.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {pacientes.map((paciente) => (
                        <li key={paciente.pkId} style={{ marginBottom: '1rem' }}>
                            <strong>{paciente.nombre} {paciente.apellido}</strong>
                            <br />
                            <button
                                onClick={() => handleDelete(paciente.pkId)}
                                style={{ marginTop: '0.5rem', padding: '0.3rem 1rem', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px' }}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tienes pacientes vinculados.</p>
            )}

            <button
                onClick={handleLogout}
                style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: 'black', color: 'white', borderRadius: '5px' }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default DoctorPanelPage;

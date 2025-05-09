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
    const [medico, setMedico] = useState(null); // ✅ Estado para guardar el objeto del médico

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
                try {
                    const token = await user.getIdToken();
                    const res = await axios.get(
                        `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(email)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("📦 Respuesta completa:", res.data);
                    const doctorData = res.data;
                    setDoctorImage(doctorData.urlImagen);
                    setMedicoId(doctorData.pkId);
                    setMedico(doctorData); // ✅ Guardamos el objeto completo del médico
                } catch (error) {
                    console.error('❌ Error al obtener los detalles del médico:', error);
                }
            } else {
                console.error('❌ Usuario no autenticado');
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPacientes = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                try {
                    const res = await axios.get(`${API_GATEWAY}/api/pacientes/del-medico`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setPacientes(res.data);
                } catch (err) {
                    console.error('Error al obtener pacientes:', err);
                }
            }
        };

        fetchPacientes();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta vinculación?")) {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                try {
                    if (medicoId && id) {
                        await axios.delete(`${API_GATEWAY}/api/vinculacion?pacienteId=${id}&medicoId=${medicoId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        setPacientes((prevPacientes) => prevPacientes.filter((p) => p.pkId !== id));
                        alert("Vinculación eliminada exitosamente");
                    } else {
                        console.error("❌ El ID del médico o paciente está indefinido");
                    }
                } catch (err) {
                    console.error("❌ Error al eliminar vinculación:", err.response || err);
                    alert("Error al eliminar vinculación");
                }
            }
        }
    };

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Bienvenido al panel del médico</h1>
            {doctorImage && <img src={doctorImage} alt="Doctor" style={{ width: '150px', borderRadius: '50%' }} />}
            <button
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
                onClick={() => navigate('/register-patient', { state: { medico } })} // ✅ Usamos el estado `medico`
            >
                Agregar Paciente
            </button>

            <h2>Lista de Pacientes</h2>
            <ul>
                {pacientes.map((paciente) => (
                    <li key={paciente.pkId}>
                        {paciente.nombre} {paciente.apellido}
                        <button onClick={() => handleDelete(paciente.pkId)}>Eliminar</button>
                    </li>
                ))}
            </ul>

            <button
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
                onClick={handleLogout}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default DoctorPanelPage;

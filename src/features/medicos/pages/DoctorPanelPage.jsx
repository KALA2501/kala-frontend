import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const DoctorPanelPage = () => {
    const navigate = useNavigate();
    const [doctorImage, setDoctorImage] = useState('');
    const [pacientes, setPacientes] = useState([]);
    const [medicoId, setMedicoId] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
                try {
                    const token = await user.getIdToken();
                    console.log(token); // Verificar si el token aparece en la consola antes de la petición
                    const res = await axios.get(
                        `http://localhost:8080/api/medicos/buscar-por-correo?correo=${encodeURIComponent(email)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("📦 Respuesta completa:", res.data);
                    const doctorData = res.data;
                    setDoctorImage(doctorData.urlImagen);
                    setMedicoId(doctorData.pkId); // Guardamos el ID del médico
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
                    const res = await axios.get('http://localhost:8080/api/pacientes/del-medico', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    console.log("📋 Pacientes recibidos:", res.data); // Depuración para verificar los datos recibidos
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
                console.log("📤 Eliminando vinculación con pacienteId:", id, "y medicoId:", medicoId);
                try {
                    // Asegúrate de que los parámetros estén definidos antes de enviarlos
                    if (medicoId && id) {
                        await axios.delete(`http://localhost:8080/api/vinculacion?pacienteId=${id}&medicoId=${medicoId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        setPacientes((prevPacientes) => prevPacientes.filter((paciente) => paciente.pkId !== id));
                        alert("Vinculación eliminada exitosamente");
                    } else {
                        console.error("❌ El ID del médico o paciente está indefinido");
                    }
                } catch (err) {
                    console.error("❌ Error al eliminar vinculación:", err.response || err);
                    alert("Error al eliminar vinculación");
                }
            } else {
                console.error("❌ Usuario no autenticado");
            }
        } else {
            console.log("⚪ Eliminación cancelada por el usuario");
        }
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Bienvenido al panel del médico</h1>
            {doctorImage && <img src={doctorImage} alt="Doctor" style={{ width: '150px', borderRadius: '50%' }} />}
            <button
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
                onClick={() => navigate('/register-patient')}
            >
                Agregar Paciente
            </button>

            <h2>Lista de Pacientes</h2>
            <ul>
                {pacientes.map((paciente) => (
                    <li key={paciente.pkId}>
                        {paciente.nombre} {paciente.apellido}
                        <button onClick={() => handleDelete(paciente.pkId, paciente.medicoId)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DoctorPanelPage;

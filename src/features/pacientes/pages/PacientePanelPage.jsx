import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const PacientePanelPage = () => {
    const navigate = useNavigate();
    const [pacienteImage, setPacienteImage] = useState('');
    const [pacienteNombre, setPacienteNombre] = useState('');
    const [medicos, setMedicos] = useState([]);
    const [pacienteId, setPacienteId] = useState('');

    // Cuando se detecte un usuario autenticado en Firebase
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
                try {
                    const token = await user.getIdToken();
                    console.log("🔑 Token JWT:", token); // Imprimir el token JWT para depuración

                    if (!token || token.split('.').length !== 3) {
                        throw new Error("Token JWT inválido o malformado");
                    }

                    // Obtener los detalles del paciente
                    const res = await axios.get(
                        `API_GATEWAY/api/pacientes/buscar-por-correo?email=${encodeURIComponent(email)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    const pacienteData = res.data;
                    setPacienteImage(pacienteData.urlImagen);
                    setPacienteNombre(pacienteData.nombre);
                    setPacienteId(pacienteData.pkId);

                    // Obtener médicos vinculados al paciente
                    const medicosRes = await axios.get(
                        `API_GATEWAY/api/pacientes/${pacienteData.pkId}/medicos`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setMedicos(medicosRes.data);
                } catch (error) {
                    if (error.message.includes("Token JWT inválido")) {
                        console.error("❌ Error: El token JWT es inválido o malformado.");
                    } else if (error.response) {
                        console.error(`❌ Error ${error.response.status}:`, error.response.data);
                    } else if (error.request) {
                        console.error('❌ Error en la solicitud:', error.request);
                    } else {
                        console.error('❌ Error desconocido:', error.message);
                    }
                }
            } else {
                console.error('❌ Usuario no autenticado');
            }
        });

        return () => unsubscribe();
    }, []);

    // Cerrar sesión
    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut()
            .then(() => {
                console.log("Sesión cerrada");
                navigate("/login"); // Redirigir a la página de login
            })
            .catch((error) => {
                console.error('Error al cerrar sesión:', error);
            });
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Bienvenido al Panel del Paciente</h1>

            {/* Foto del paciente */}
            {pacienteImage && <img src={pacienteImage} alt="Paciente" style={{ width: '150px', borderRadius: '50%' }} />}

            {/* Nombre del paciente */}
            <h2>{pacienteNombre}</h2>

            {/* Lista de médicos */}
            <h3>Lista de Médicos Vinculados</h3>
            {medicos.length > 0 ? (
                <ul>
                    {medicos.map((medico) => (
                        <li key={medico.pkId}>
                            {medico.nombre} {medico.apellido} - Especialidad: {medico.especialidad}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tienes médicos vinculados.</p>
            )}

            {/* Botón de cerrar sesión */}
            <button
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    fontSize: '1rem',
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                }}
                onClick={handleLogout}
            >
                Cerrar sesión
            </button>
        </div>
    );
};

export default PacientePanelPage;

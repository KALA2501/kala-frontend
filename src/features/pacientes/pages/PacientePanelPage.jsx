import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MenuLateralPaciente from './Components/MenuLateralPaciente';


const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const PacientePanelPage = () => {
    const navigate = useNavigate();
    const [pacienteImage, setPacienteImage] = useState('');
    const [pacienteNombre, setPacienteNombre] = useState('');
    const [medicos, setMedicos] = useState([]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
                try {
                    const token = await user.getIdToken();

                    if (!token || token.split('.').length !== 3) {
                        throw new Error("Token JWT inválido o malformado");
                    }

                    const res = await axios.get(
                        `${API_GATEWAY}/api/pacientes/buscar-por-correo?email=${encodeURIComponent(email)}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    const pacienteData = res.data;
                    setPacienteImage(pacienteData.urlImagen);
                    setPacienteNombre(pacienteData.nombre);

                    const medicosRes = await axios.get(
                        `${API_GATEWAY}/api/pacientes/${pacienteData.pkId}/medicos`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setMedicos(medicosRes.data);
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                console.error('Usuario no autenticado');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut()
            .then(() => {
                navigate("/login");
            })
            .catch((error) => {
                console.error('Error al cerrar sesión:', error);
            });
    };

    return (
        <div className="flex min-h-screen bg-[#F5F5F5]">
            {/* Menu lateral */}
            <MenuLateralPaciente onLogout={handleLogout} />

            {/* Contenido principal */}
            <main className="flex-1 p-6 flex flex-col items-center">
                <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-3xl font-bold text-[#30028D] mb-4">Panel del Paciente</h1>

                    {pacienteImage && (
                        <img
                            src={pacienteImage}
                            alt="Paciente"
                            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        />
                    )}

                    <h2 className="text-2xl font-semibold text-[#7358F5] mb-6">{pacienteNombre}</h2>

                    <h3 className="text-xl font-bold text-[#30028D] mb-2">Médicos Vinculados</h3>
                    {medicos.length > 0 ? (
                        <ul className="text-left list-disc list-inside mb-4">
                            {medicos.map((medico) => (
                                <li key={medico.pkId} className="text-gray-700">
                                    {medico.nombre} {medico.apellido} - <span className="italic">{medico.especialidad}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">No tienes médicos vinculados.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PacientePanelPage;

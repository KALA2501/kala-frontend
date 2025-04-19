import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const PacientePanelPage = () => {
    const navigate = useNavigate();
    const [pacienteImage, setPacienteImage] = useState('');
    const [pacientes, setPacientes] = useState([]);
    const [pacienteId, setPacienteId] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
                try {
                    const token = await user.getIdToken();
                    console.log(token); // Verificar si el token aparece en la consola antes de la petición
                    const res = await axios.get(
                        `http://localhost:8080/api/pacientes/buscar-por-correo?correo=${encodeURIComponent(email)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("📦 Respuesta completa:", res.data);
                    const pacienteData = res.data;
                    setPacienteImage(pacienteData.urlImagen);
                    setPacienteId(pacienteData.pkId); // Guardamos el ID del paciente
                } catch (error) {
                    console.error('❌ Error al obtener los detalles del paciente:', error);
                }
            } else {
                console.error('❌ Usuario no autenticado');
            }
        });
        return () => unsubscribe();
    }, []);

};

export default PacientePanelPage;
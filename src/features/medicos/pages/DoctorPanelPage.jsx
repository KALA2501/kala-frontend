import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const DoctorPanelPage = () => {
    const navigate = useNavigate();
    const [doctorImage, setDoctorImage] = useState('');
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
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    console.log("📦 Respuesta completa:", res.data);
                    const doctorData = res.data;
                    setDoctorImage(doctorData.urlImagen);
                } catch (error) {
                    console.error('❌ Error al obtener los detalles del médico:', error);
                }
            } else {
                console.error('❌ Usuario no autenticado');
            }
        });
        return () => unsubscribe();
    }, []);




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
        </div>
    );
};

export default DoctorPanelPage;

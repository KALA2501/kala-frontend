import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { subirImagen } from '../../../services/firebase';
import { getAuth, signInAnonymously } from 'firebase/auth';

const HomePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        correo: '',
        telefono: '',
        urlLogo: ''
    });

    const [errors, setErrors] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [subiendoLogo, setSubiendoLogo] = useState(false);
    const [archivoLogo, setArchivoLogo] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogoUpload = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        setArchivoLogo(archivo);
        setMensaje('✅ Imagen seleccionada. Se subirá cuando envíes la solicitud.');
    };

    const validar = () => {
        let newErrors = {};
        if (!formData.nombre) newErrors.nombre = 'Nombre requerido';
        if (!formData.direccion) newErrors.direccion = 'Dirección requerida';
        if (!formData.correo) {
            newErrors.correo = 'Correo requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'Correo inválido';
        }
        if (!formData.telefono) newErrors.telefono = 'Teléfono requerido';
        if (!archivoLogo && !formData.urlLogo) newErrors.urlLogo = 'Debes subir el logo del centro';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errores = validar();
        if (Object.keys(errores).length > 0) {
            setErrors(errores);
            return;
        }

        try {
            setSubiendoLogo(true);
            let urlLogoFinal = formData.urlLogo;

            // Verificar si el usuario está autenticado anónimamente
            const auth = getAuth();
            if (!auth.currentUser) {
                await signInAnonymously(auth); // Autenticación anónima si no hay usuario autenticado
            }

            const token = await auth.currentUser.getIdToken();
            console.log("Token JWT:", token); // Asegúrate de que el token se imprima en la consola

            // Subir imagen si hay archivo seleccionado y aún no se ha subido
            if (archivoLogo && !urlLogoFinal) {
                urlLogoFinal = await subirImagen(archivoLogo, 'centros-medicos');
            }

            // Enviar la solicitud con el token en los encabezados
            await axios.post('http://localhost:8080/api/solicitudes-centro-medico', {
                ...formData,
                urlLogo: urlLogoFinal,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            setMensaje('✅ Centro médico registrado correctamente. Revisa tu correo.');
            setFormData({
                nombre: '',
                direccion: '',
                correo: '',
                telefono: '',
                urlLogo: ''
            });
            setArchivoLogo(null);
            setErrors({});
        } catch (error) {
            console.error(error);
            if (error.response?.status === 409) {
                setMensaje('⚠️ Ya existe una solicitud con ese correo o teléfono.');
            } else {
                setMensaje('❌ Ocurrió un error al registrar. Intenta más tarde.');
            }
        } finally {
            setSubiendoLogo(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Bienvenido a KALA</h1>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Iniciar Sesión
                </button>
            </div>
            <p>Plataforma para gestión de actividades cognitivas para adultos mayores.</p>

            <h2>Solicitar registro como Centro Médico</h2>
            {mensaje && <p style={{ color: mensaje.startsWith('✅') ? 'green' : 'red' }}>{mensaje}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    name="nombre"
                    placeholder="Nombre del centro"
                    value={formData.nombre}
                    onChange={handleChange}
                />
                {errors.nombre && <div style={{ color: 'red' }}>{errors.nombre}</div>}
                <br />

                <input
                    name="direccion"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={handleChange}
                />
                {errors.direccion && <div style={{ color: 'red' }}>{errors.direccion}</div>}
                <br />

                <input
                    type="email"
                    name="correo"
                    placeholder="Correo electrónico"
                    value={formData.correo}
                    onChange={handleChange}
                />
                {errors.correo && <div style={{ color: 'red' }}>{errors.correo}</div>}
                <br />

                <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                />
                {errors.telefono && <div style={{ color: 'red' }}>{errors.telefono}</div>}
                <br />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                />
                {errors.urlLogo && <div style={{ color: 'red' }}>{errors.urlLogo}</div>}
                {archivoLogo && (
                    <div>
                        <img
                            src={URL.createObjectURL(archivoLogo)}
                            alt="Vista previa"
                            style={{ maxWidth: '120px', marginTop: '1rem', borderRadius: '8px' }}
                        />
                    </div>
                )}
                <br />

                <button type="submit" disabled={subiendoLogo}>
                    {subiendoLogo ? 'Subiendo imagen...' : 'Enviar solicitud'}
                </button>
            </form>
        </div>
    );
};

export default HomePage;

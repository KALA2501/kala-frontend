import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { subirImagen } from '../../../services/firebase';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const RegisterPatientPage = () => {
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', tipoDocumento: 'CC', idDocumento: '',
        fechaNacimiento: '', codigoCIE: '', telefono: '', email: '',
        direccion: '', etapa: 1, genero: '', urlImagen: '', tipoVinculacion: '', contactoEmergencia: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [medico, setMedico] = useState(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [tiposVinculacion, setTiposVinculacion] = useState([
        { id: 'TV01', tipo: 'MEDICO', descripcion: 'Vinculación con médico' },
        { id: 'TV02', tipo: 'PACIENTE', descripcion: 'Vinculación con paciente' }
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdTokenResult();
                const correo = user.email;
                const rol = token.claims?.role || token.claims?.rol;


                if (rol === 'medico') {
                    try {
                        const res = await axios.get(
                            `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${correo}`,
                            { headers: { Authorization: `Bearer ${token.token}` } }
                        );
                        setMedico(res.data);
                    } catch (err) {
                        console.error('Error buscando médico:', err);
                        navigate('/');
                    }
                } else if (rol === 'paciente') {
                    console.log('El usuario autenticado es un paciente.');
                } else {
                    console.error('Rol no reconocido:', rol);
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagen = (e) => {
        const archivo = e.target.files[0];
        if (archivo) setImagenSeleccionada(archivo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            console.log(token); // Verificar si el token aparece en la consola antes de la petición

            let urlImagen = '';
            if (imagenSeleccionada) {
                urlImagen = await subirImagen(imagenSeleccionada, 'pacientes');
            }

            const payload = {
                ...formData,
                fechaNacimiento: formData.fechaNacimiento,
                etapa: parseInt(formData.etapa),
                tipoDocumento: formData.tipoDocumento,
                centroMedico: medico.centroMedico.pkId,
                urlImagen,
                password: 'paciente123', // Contraseña temporal asignada automáticamente
                tipoVinculacionId: formData.tipoVinculacion,
                rol: 'paciente'
            };

            await axios.post(`${API_GATEWAY}/api/pacientes/registrar-completo`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje('✅ Paciente registrado exitosamente');
        } catch (error) {
            console.error(error);
            setMensaje(`❌ Error: ${error.response?.data || 'No se pudo registrar el paciente'}`);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Registrar nuevo paciente</h2>
            {mensaje && <div style={{ marginBottom: '1rem', color: mensaje.includes('✅') ? 'green' : 'red' }}>{mensaje}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <label htmlFor="nombre">Nombre:</label>
                <input id="nombre" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />

                <label htmlFor="apellido">Apellido:</label>
                <input id="apellido" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />

                <label htmlFor="tipoDocumento">Tipo de Documento:</label>
                <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required>
                    <option value="">Seleccionar tipo de documento</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="PEP">Permiso Especial de Permanencia</option>
                </select>

                <label htmlFor="idDocumento">Número de Documento:</label>
                <input id="idDocumento" name="idDocumento" placeholder="Número de Documento" value={formData.idDocumento} onChange={handleChange} required />

                <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
                <input id="fechaNacimiento" type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />

                <label htmlFor="codigoCIE">Código CIE:</label>
                <input id="codigoCIE" name="codigoCIE" placeholder="Código CIE" value={formData.codigoCIE} onChange={handleChange} />

                <label htmlFor="telefono">Teléfono:</label>
                <input id="telefono" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />

                <label htmlFor="email">Correo Electrónico:</label>
                <input id="email" name="email" placeholder="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} required />

                <label htmlFor="direccion">Dirección:</label>
                <input id="direccion" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} />

                <label htmlFor="etapa">Etapa:</label>
                <input id="etapa" name="etapa" placeholder="Etapa" type="number" value={formData.etapa} onChange={handleChange} />

                <label htmlFor="genero">Género:</label>
                <select id="genero" name="genero" value={formData.genero} onChange={handleChange}>
                    <option value="">Seleccionar género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                </select>

                <input id="tipoVinculacion" name="tipoVinculacion" value="TV02" readOnly hidden />

                <label htmlFor="contactoEmergencia">Contacto de Emergencia:</label>
                <input id="contactoEmergencia" name="contactoEmergencia" placeholder="Contacto de Emergencia" value={formData.contactoEmergencia} onChange={handleChange} required />

                <label htmlFor="fotoPaciente">Foto del Paciente:</label>
                <input id="fotoPaciente" type="file" accept="image/*" onChange={handleImagen} />

                <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px' }}>
                    Registrar Paciente
                </button>
            </form>

            <button onClick={() => navigate('/medico-panel')} style={{ marginTop: '1rem', backgroundColor: '#f44336', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px' }}>
                Volver al Panel de Médicos
            </button>
        </div>
    );
};

export default RegisterPatientPage;

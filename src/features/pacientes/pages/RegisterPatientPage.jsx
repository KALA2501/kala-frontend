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
        direccion: '', etapa: 1, genero: '', urlImagen: '',
        tipoVinculacion: 'TV02', 
        contactoEmergencia: '',
        ceNombre: '', ceApellido: '', ceRelacion: '', ceTelefono: '', ceDireccion: '', ceEmail: ''
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

    // Buscar contacto por teléfono
    const buscarContactoExistente = async (telefono, token) => {
        try {
            const res = await axios.get(`${API_GATEWAY}/api/contacto-emergencia/buscar-por-telefono?telefono=${telefono}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data; // contacto encontrado
        } catch {
            return null; // no encontrado
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            // Subir imagen si existe
            let urlImagen = '';
            if (imagenSeleccionada) {
                urlImagen = await subirImagen(imagenSeleccionada, 'pacientes');
            }

            // Paso 1: Buscar contacto de emergencia
            let contactoId = null;
            const contactoExistente = await buscarContactoExistente(formData.ceTelefono, token);

            if (contactoExistente) {
                const usarExistente = window.confirm(
                    `Ya existe un contacto con ese teléfono:\n\nNombre: ${contactoExistente.nombre} ${contactoExistente.apellido}\nRelación: ${contactoExistente.relacion}\n¿Deseas usar este contacto?`
                );
                if (usarExistente) {
                    contactoId = contactoExistente.pkId;
                }
            }

            // Paso 2: Si no existe o no se quiere usar el existente, registramos uno nuevo
            if (!contactoId) {
                const contactoEmergenciaPayload = {
                    nombre: formData.ceNombre,
                    apellido: formData.ceApellido,
                    relacion: formData.ceRelacion,
                    direccion: formData.ceDireccion,
                    telefono: formData.ceTelefono,
                    email: formData.ceEmail
                };

                const contactoRes = await axios.post(`${API_GATEWAY}/api/contacto-emergencia`, contactoEmergenciaPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                contactoId = contactoRes.data.pkId;
            }

            // Asegurarse de que contactoId no sea undefined y loguearlo antes de la petición final
            console.log("➡️ ID de contacto a registrar con el paciente:", contactoId);

            // Enviar contactoId al backend
            const payload = {
                ...formData,
                fechaNacimiento: formData.fechaNacimiento,
                etapa: parseInt(formData.etapa),
                tipoDocumento: formData.tipoDocumento,
                centroMedico: medico.centroMedico.pkId,
                urlImagen,
                password: 'paciente123',
                tipoVinculacionId: formData.tipoVinculacion,
                rol: 'paciente',
                contactoEmergencia: { pkId: contactoId } 
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

                <label htmlFor="fotoPaciente">Foto del Paciente:</label>
                <input id="fotoPaciente" type="file" accept="image/*" onChange={handleImagen} />

                <h3>Contacto de Emergencia</h3>

                <label htmlFor="ceNombre">Nombre:</label>
                <input id="ceNombre" name="ceNombre" placeholder="Nombre" value={formData.ceNombre || ''} onChange={handleChange} required />

                <label htmlFor="ceApellido">Apellido:</label>
                <input id="ceApellido" name="ceApellido" placeholder="Apellido" value={formData.ceApellido || ''} onChange={handleChange} required />

                <label htmlFor="ceRelacion">Relación:</label>
                <input id="ceRelacion" name="ceRelacion" placeholder="Relación" value={formData.ceRelacion || ''} onChange={handleChange} required />

                <label htmlFor="ceTelefono">Teléfono:</label>
                <input id="ceTelefono" name="ceTelefono" placeholder="Teléfono" value={formData.ceTelefono || ''} onChange={handleChange} required />

                <label htmlFor="ceDireccion">Dirección:</label>
                <input id="ceDireccion" name="ceDireccion" placeholder="Dirección" value={formData.ceDireccion || ''} onChange={handleChange} />

                <label htmlFor="ceEmail">Email:</label>
                <input id="ceEmail" name="ceEmail" placeholder="Email" type="email" value={formData.ceEmail || ''} onChange={handleChange} />

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

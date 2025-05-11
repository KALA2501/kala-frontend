import React, { useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { subirImagen } from '../../../services/firebase';
import { useLocation } from 'react-router-dom';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const RegistroPacienteSoft = () => {
    const { state } = useLocation();
    const medico = state?.medico;

    const [mensaje, setMensaje] = useState('');
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [contactoId, setContactoId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', tipoDocumento: 'CC', idDocumento: '',
        fechaNacimiento: '', codigoCIE: '', telefono: '', email: '',
        direccion: '', etapa: 1, genero: '',
        ceNombre: '', ceApellido: '', ceRelacion: '',
        ceTelefono: '', ceDireccion: '', ceEmail: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagen = (e) => {
        const archivo = e.target.files[0];
        if (archivo) setImagenSeleccionada(archivo);
    };

    const crearContactoEmergencia = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const contactoEmergencia = {
                nombre: formData.ceNombre,
                apellido: formData.ceApellido,
                relacion: formData.ceRelacion,
                direccion: formData.ceDireccion,
                telefono: formData.ceTelefono,
                email: formData.ceEmail
            };

            const res = await axios.post(
                `${API_GATEWAY}/api/contacto-emergencia/crear`,
                contactoEmergencia,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setContactoId(res.data.pkId);
            setMensaje("✅ Contacto de emergencia creado exitosamente");

        } catch (err) {
            console.error(err);
            setMensaje(`❌ Error al crear contacto: ${err.response?.data || err.message}`);
        }
    };

    const registrarPaciente = async () => {
        try {
            if (!contactoId) {
                setMensaje("⚠️ Primero crea el contacto de emergencia");
                return;
            }

            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            let urlImagen = '';
            if (imagenSeleccionada) {
                urlImagen = await subirImagen(imagenSeleccionada, 'pacientes');
            }

            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                tipoDocumento: { id: formData.tipoDocumento },
                idDocumento: formData.idDocumento,
                fechaNacimiento: formData.fechaNacimiento,
                codigoCIE: parseInt(formData.codigoCIE),
                telefono: formData.telefono,
                email: formData.email,
                direccion: formData.direccion,
                etapa: parseInt(formData.etapa),
                genero: formData.genero,
                urlImagen,
                contactoEmergencia: { pkId: contactoId },
                centroMedico: { pkId: medico?.centroMedico?.pkId },
                medico: { pkId: medico?.pkId },
                tipoVinculacion: { id: "TV02" } // 🔥 quemado fijo
            };

            console.log("🧪 Payload enviado:", JSON.stringify(payload, null, 2));

            await axios.post(`${API_GATEWAY}/api/pacientes/registrar-completo`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje("✅ Paciente registrado correctamente");

        } catch (err) {
            console.error(err);
            setMensaje(`❌ Error al registrar paciente: ${err.response?.data || err.message}`);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
            <h2>Registro de Paciente</h2>

            {mensaje && (
                <div style={{
                    background: mensaje.includes("✅") ? '#d1fae5' : '#fee2e2',
                    color: mensaje.includes("✅") ? '#065f46' : '#991b1b',
                    padding: '1rem', marginBottom: '1rem', borderRadius: '5px'
                }}>
                    {mensaje}
                </div>
            )}

            <form style={{ display: 'grid', gap: '1rem' }}>
                <h3>Contacto de Emergencia</h3>
                <input name="ceNombre" placeholder="Nombre" value={formData.ceNombre} onChange={handleChange} required />
                <input name="ceApellido" placeholder="Apellido" value={formData.ceApellido} onChange={handleChange} required />
                <input name="ceRelacion" placeholder="Relación" value={formData.ceRelacion} onChange={handleChange} required />
                <input name="ceTelefono" placeholder="Teléfono" value={formData.ceTelefono} onChange={handleChange} required />
                <input name="ceDireccion" placeholder="Dirección" value={formData.ceDireccion} onChange={handleChange} />
                <input name="ceEmail" type="email" placeholder="Email" value={formData.ceEmail} onChange={handleChange} />
                <button type="button" onClick={crearContactoEmergencia}>Crear Contacto</button>

                <h3>Datos del Paciente</h3>
                <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}>
                    <option value="CC">Cédula</option>
                    <option value="TI">Tarjeta Identidad</option>
                    <option value="CE">Cédula Extranjera</option>
                </select>
                <input name="idDocumento" placeholder="Número de Documento" value={formData.idDocumento} onChange={handleChange} required />
                <input name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} required />
                <input name="codigoCIE" placeholder="Código CIE" value={formData.codigoCIE} onChange={handleChange} required />
                <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} />
                <input name="etapa" type="number" placeholder="Etapa" value={formData.etapa} onChange={handleChange} required />
                <select name="genero" value={formData.genero} onChange={handleChange}>
                    <option value="">Seleccione Género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                </select>

                <label>Imagen del Paciente</label>
                <input type="file" accept="image/*" onChange={handleImagen} />

                <button type="button" onClick={registrarPaciente}>Registrar Paciente</button>
            </form>
        </div>
    );
};

export default RegistroPacienteSoft;

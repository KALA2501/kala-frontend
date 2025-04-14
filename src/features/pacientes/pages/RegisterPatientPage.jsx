import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { subirImagen } from '../../../services/firebase';

const RegisterPatientPage = () => {
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', tipoDocumento: 'CC', idDocumento: '',
        fechaNacimiento: '', codigoCIE: '', telefono: '', email: '',
        direccion: '', etapa: 1, zona: '', distrito: '', genero: '', urlImagen: '',
        password: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [medico, setMedico] = useState(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                const correo = user.email;
                try {
                    const res = await axios.get(
                        `http://localhost:8080/api/medicos/buscar-por-correo?correo=${correo}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setMedico(res.data);
                } catch (err) {
                    console.error('Error buscando médico:', err);
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
                urlImagen
            };

            await axios.post('http://localhost:8080/api/pacientes/registrar-completo', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje('✅ Paciente registrado exitosamente');
            setTimeout(() => navigate('/medico'), 2000);
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
                <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PAS">Pasaporte</option>
                </select>
                <input name="idDocumento" placeholder="Número de Documento" value={formData.idDocumento} onChange={handleChange} required />
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                <input name="codigoCIE" placeholder="Código CIE" value={formData.codigoCIE} onChange={handleChange} />
                <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
                <input name="email" placeholder="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} required />
                <input name="password" placeholder="Contraseña temporal" type="password" value={formData.password} onChange={handleChange} required />
                <input name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} />
                <input name="etapa" placeholder="Etapa" type="number" value={formData.etapa} onChange={handleChange} />
                <input name="zona" placeholder="Zona" value={formData.zona} onChange={handleChange} />
                <input name="distrito" placeholder="Distrito" value={formData.distrito} onChange={handleChange} />
                <select name="genero" value={formData.genero} onChange={handleChange}>
                    <option value="">Seleccionar género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                </select>

                <label><strong>Foto del paciente:</strong></label>
                <input type="file" accept="image/*" onChange={handleImagen} />

                <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px' }}>
                    Registrar Paciente
                </button>
            </form>
        </div>
    );
};

export default RegisterPatientPage;

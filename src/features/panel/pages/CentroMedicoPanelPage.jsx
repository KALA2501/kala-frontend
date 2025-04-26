import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { subirImagen } from '../../../services/firebase';

const CentroMedicoPanelPage = () => {
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState('medicos');
    const [centro, setCentro] = useState(null);
    const [logo, setLogo] = useState('');
    const [logoSubido, setLogoSubido] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        tipoDocumento: 'CC',
        idDocumento: '',
        fechaNacimiento: '',
        profesion: 'Médico',
        especialidad: 'General',
        especialidadCustom: '',
        telefono: '',
        direccion: '',
        genero: '',
        tarjetaProfesional: '',
        urlLogo: '',
        correo: ''
    });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("📥 useEffect ejecutado");
            console.log("Usuario autenticado:", user);
            if (user) {
                const email = user.email;
                const token = await user.getIdToken();
                console.log("Token obtenido:", token); // Mover después de definir 'token'
                try {
                    const res = await axios.get(
                        `http://localhost:8080/api/centro-medico/buscar-por-correo?correo=${encodeURIComponent(email)}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    const centroData = res.data;
                    setCentro(centroData);
                    const centroId = centroData.pkId;
                    console.log("Centro médico obtenido:", centroData);
                    console.log("ID del centro médico:", centroId);
                    localStorage.setItem('idCentro', centroId);
                    cargarDatos(centroId, token);
                } catch (error) {
                    console.error('Error al obtener centro:', error);
                    setMensaje('❌ No se pudo identificar el centro médico');
                }
            } else {
                window.location.href = '/'; // redirige si NO hay usuario
            }
        });
        return () => unsubscribe();
    }, []);

    const cargarDatos = async (idCentro, token) => {
        try {
            setLoading(true);
            console.log("📤 Cargando datos para el centro ID:", idCentro);
            console.log("Token utilizado:", token);

            const [medicosRes, pacientesRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/medicos/centro-medico/${idCentro}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:8080/api/pacientes/centro-medico/${idCentro}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Logs para verificar los datos recibidos
            console.log("Respuesta de médicos:", medicosRes.data);
            console.log("Respuesta de pacientes:", pacientesRes.data);

            setMedicos(medicosRes.data);
            setPacientes(pacientesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setMensaje('❌ Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEspecialidadChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            especialidad: value,
            especialidadCustom: value === 'Otra' ? prev.especialidadCustom : ''
        }));
    };

    const handleLogoCentro = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        try {
            const url = await subirImagen(archivo, 'centros-medicos');
            setLogo(url);
            setLogoSubido(true);
            setFormData((prev) => ({ ...prev, urlLogo: url }));
        } catch (error) {
            console.error('Error subiendo logo', error);
            setMensaje('❌ Error al subir el logo');
        }
    };

    const handleImagenMedico = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        try {
            const url = await subirImagen(archivo, 'medicos');
            setLogo(url);
            setLogoSubido(true);
            setFormData((prev) => ({ ...prev, urlLogo: url }));
        } catch (error) {
            console.error('Error subiendo imagen del médico', error);
            setMensaje('❌ Error al subir la imagen del médico');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!logoSubido || !logo) {
            setMensaje('❌ Debes subir la imagen del médico antes de continuar');
            return;
        }
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user.getIdToken();

            let especialidadFinal = formData.especialidad;
            if (especialidadFinal === 'Otra' && formData.especialidadCustom.trim() !== '') {
                especialidadFinal = formData.especialidadCustom.trim();
            }

            const medicoAEnviar = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                tipoDocumento: { id: formData.tipoDocumento },
                idDocumento: formData.idDocumento,
                fechaNacimiento: formData.fechaNacimiento,
                profesion: 'Médico',
                especialidad: especialidadFinal,
                telefono: formData.telefono,
                direccion: formData.direccion,
                genero: formData.genero,
                tarjetaProfesional: formData.tarjetaProfesional,
                urlImagen: logo,
                correo: formData.correo,
                centroMedico: { pkId: centro.pkId }
            };

            console.log('Datos enviados al backend:', medicoAEnviar); // Depuración para verificar el contenido del objeto

            await axios.post('http://localhost:8080/api/medicos', medicoAEnviar, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje('✅ Médico creado exitosamente');
            setShowForm(false);
            setFormData({
                nombre: '', apellido: '', tipoDocumento: 'CC', idDocumento: '', fechaNacimiento: '',
                profesion: 'Médico', especialidad: 'General', especialidadCustom: '', telefono: '',
                direccion: '', genero: '', tarjetaProfesional: '', urlLogo: '', correo: ''
            });
            setLogo('');
            setLogoSubido(false);

            const idCentro = localStorage.getItem('idCentro');
            cargarDatos(idCentro, token);
        } catch (error) {
            console.error('Error al crear el médico:', error.response?.data || error.message); // Capturar respuesta del backend
            setMensaje(`❌ ${error.response?.data || 'Error al crear el médico'}`);
        }
    };

    const handleLogout = async () => {
        const auth = getAuth();
        await auth.signOut();
        localStorage.removeItem('idCentro'); // por si guardás algo ahí
        window.location.href = '/'; // redirige al home
    };


    const eliminarMedico = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este médico?')) return;
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                setMensaje('❌ Usuario no autenticado');
                return;
            }
            const token = await user.getIdToken();
            const res = await axios.delete(`http://localhost:8080/api/medicos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje(`✅ ${res.data}`);
            const idCentro = localStorage.getItem('idCentro');
            cargarDatos(idCentro, token);
        } catch (error) {
            console.error(error);
            setMensaje(`❌ ${error.response?.data || 'Error al eliminar el médico'}`);
        }
    };

    const styles = {
        container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
        form: {
            display: 'grid',
            gap: '1rem',
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        input: {
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd'
        },
        button: (color = '#4CAF50') => ({
            padding: '0.5rem 1rem',
            backgroundColor: color,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }),
        tab: (isActive) => ({
            padding: '0.75rem 1.5rem',
            backgroundColor: isActive ? '#4CAF50' : 'white',
            color: isActive ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: '0.2s all'
        }),
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem'
        },
        th: {
            textAlign: 'left',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #ddd'
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid #ddd'
        },
        mensaje: {
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: mensaje.includes('❌') ? '#ffebee' : '#e8f5e9',
            color: mensaje.includes('❌') ? '#c62828' : '#2e7d32'
        }
    };

    if (loading) {
        return <div style={styles.container}>Cargando...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    {centro?.urlLogo && (
                        <img
                            src={centro.urlLogo}
                            alt="Logo del Centro Médico"
                            onClick={() => document.getElementById('input-logo').click()}
                            style={{
                                maxWidth: '130px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'opacity 0.3s',
                                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                            }}
                            title="Haz clic para cambiar el logo"
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        id="input-logo"
                        style={{ display: 'none' }}
                        onChange={handleLogoCentro}
                    />
                </div>
                <div style={{ marginLeft: '1rem' }}>
                    <h1 style={{ margin: 0 }}>Panel del Centro Médico</h1>
                    {centro?.nombre && (
                        <h2 style={{ margin: 0, fontWeight: 'normal' }}>{centro.nombre}</h2>
                    )}
                </div>
                <button onClick={() => setShowForm(!showForm)} style={styles.button()}>
                    {showForm ? 'Cancelar' : 'Agregar Médico'}
                </button>
                <button onClick={handleLogout} style={styles.button('#9e9e9e')}>
                    Cerrar sesión
                </button>

            </div>

            {mensaje && <div style={styles.mensaje}>{mensaje}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2>Registrar Nuevo Médico</h2>
                    <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} style={styles.input} />
                    <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} style={styles.input} />
                    <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} style={styles.input}>
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="TI">Tarjeta de Identidad (TI)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="PAS">Pasaporte (PAS)</option>
                    </select>
                    <input name="idDocumento" placeholder="Número de Documento" value={formData.idDocumento} onChange={handleChange} style={styles.input} />
                    <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={styles.input} />
                    <input type="text" name="profesion" value="Médico" readOnly style={styles.input} />
                    <select name="especialidad" value={formData.especialidad} onChange={handleEspecialidadChange} style={styles.input}>
                        <option value="Geriatría">Geriatría</option>
                        <option value="Neurología">Neurología</option>
                        <option value="Psiquiatría">Psiquiatría</option>
                        <option value="Neuropsicología">Neuropsicología</option>
                        <option value="Neurogeriatría">Neurogeriatría</option>
                        <option value="Otra">Otra</option>
                    </select>
                    {formData.especialidad === 'Otra' && (
                        <input name="especialidadCustom" placeholder="Escribe la especialidad" value={formData.especialidadCustom} onChange={handleChange} style={styles.input} />
                    )}
                    <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} style={styles.input} />
                    <label style={{ fontWeight: 'bold' }}>Imagen del médico:</label>
                    <input type="file" accept="image/*" onChange={handleImagenMedico} style={styles.input} />
                    {logo && (
                        <img
                            src={logo}
                            alt="Imagen del médico"
                            style={{ maxWidth: '100px', marginTop: '0.5rem', borderRadius: '8px' }}
                        />
                    )}
                    <input name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} style={styles.input} />
                    <select name="genero" value={formData.genero} onChange={handleChange} style={styles.input}>
                        <option value="">Seleccionar género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                    </select>
                    <input name="tarjetaProfesional" placeholder="Tarjeta Profesional" value={formData.tarjetaProfesional} onChange={handleChange} style={styles.input} />
                    <input name="correo" placeholder="Correo Electrónico" type="email" value={formData.correo} onChange={handleChange} style={styles.input} />
                    <button type="submit" style={styles.button()}>Registrar Médico</button>
                </form>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => setActiveTab('medicos')} style={styles.tab(activeTab === 'medicos')}>Médicos</button>
                <button onClick={() => setActiveTab('pacientes')} style={styles.tab(activeTab === 'pacientes')}>Pacientes</button>
            </div>

            {activeTab === 'medicos' ? (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Especialidad</th>
                            <th style={styles.th}>Teléfono</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicos.map((medico) => (
                            <tr key={medico.pkId}>
                                <td style={styles.td}>{`${medico.nombre} ${medico.apellido}`}</td>
                                <td style={styles.td}>{medico.especialidad}</td>
                                <td style={styles.td}>{medico.telefono}</td>
                                <td style={styles.td}>
                                    <button onClick={() => eliminarMedico(medico.pkId)} style={styles.button('#f44336')}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Documento</th>
                            <th style={styles.th}>Teléfono</th>
                            <th style={styles.th}>Médicos Asignados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientes.map((paciente) => (
                            <tr key={paciente.id}>
                                <td style={styles.td}>{`${paciente.nombre} ${paciente.apellido}`}</td>
                                <td style={styles.td}>{paciente.idDocumento}</td>
                                <td style={styles.td}>{paciente.telefono}</td>
                                <td style={styles.td}>
                                    {paciente.medicos?.map((m) => `${m.nombre} ${m.apellido}`).join(', ') || 'Sin médicos asignados'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );


};

export default CentroMedicoPanelPage;

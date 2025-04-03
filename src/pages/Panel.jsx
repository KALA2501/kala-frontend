import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { subirImagen } from '../services/firebase';

const Panel = () => {
  // Estados principales
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [activeTab, setActiveTab] = useState('medicos');
  const [centro, setCentro] = useState(null);
  const [logo, setLogo] = useState('');
  const [logoSubido, setLogoSubido] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    idDocumento: '',
    fechaNacimiento: '',
    profesion: '',
    especialidad: '',
    telefono: '',
    direccion: '',
    genero: '',
    tarjetaProfesional: '',
    urlLogo: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Verificación de autenticación
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;
        const token = await user.getIdToken();

        // Obtener info del centro
        try {
          const res = await axios.get(`http://localhost:8080/api/centro-medico/buscar-por-correo?correo=${encodeURIComponent(email)}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          const centroData = res.data;
          setCentro(centroData);
          const centroId = centroData.pkId;
          localStorage.setItem('idCentro', centroId);
          cargarDatos(centroId, token);
        } catch (error) {
          console.error('Error al obtener centro:', error);
          setMensaje('❌ No se pudo identificar el centro médico');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      if (activeTab === 'solicitudes') {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          const token = await user.getIdToken();

          const res = await axios.get('http://localhost:8080/api/solicitudes-centro-medico', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          setSolicitudes(res.data);
        } catch (error) {
          console.error('Error al cargar solicitudes:', error);
          setMensaje('❌ Error al cargar solicitudes');
        }
      }
    };

    cargarSolicitudes();
  }, [activeTab]);

  // Cargar datos
  const cargarDatos = async (idCentro, token) => {
    try {
      setLoading(true);
      const [medicosRes, pacientesRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/medicos/centro-medico/${idCentro}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }),
        axios.get(`http://localhost:8080/api/pacientes/centro-medico/${idCentro}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        })
      ]);
      setMedicos(medicosRes.data);
      setPacientes(pacientesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje('❌ Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoCentro = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try {
      const url = await subirImagen(archivo, 'centros-medicos');
      setLogo(url);
      setLogoSubido(true);
      setFormData(prev => ({ ...prev, urlLogo: url }));
    } catch (error) {
      console.error("Error subiendo logo", error);
      setMensaje("❌ Error al subir el logo");
    }
  };

  // Crear nuevo médico
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logoSubido || !logo) {
      setMensaje("❌ Debes subir el logo del centro antes de continuar");
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.post('http://localhost:8080/api/medicos', formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setMensaje('✅ Médico creado exitosamente');
      setShowForm(false);
      setFormData({
        nombre: '',
        apellido: '',
        tipoDocumento: '',
        idDocumento: '',
        fechaNacimiento: '',
        profesion: '',
        especialidad: '',
        telefono: '',
        direccion: '',
        genero: '',
        tarjetaProfesional: '',
        urlLogo: ''
      });
      setLogo('');
      setLogoSubido(false);
      const idCentro = localStorage.getItem('idCentro');
      cargarDatos(idCentro, token);
    } catch (error) {
      setMensaje('❌ Error al crear el médico');
    }
  };

  // Eliminar médico
  const eliminarMedico = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este médico?')) return;
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.delete(`http://localhost:8080/api/medicos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setMensaje('✅ Médico eliminado exitosamente');
      const idCentro = localStorage.getItem('idCentro');
      cargarDatos(idCentro, token);
    } catch (error) {
      setMensaje('❌ Error al eliminar el médico');
    }
  };

  const handleLogoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    try {
      const urlNueva = await subirImagen(archivo, 'centros-medicos');
      if (!urlNueva) {
        setMensaje('❌ Error al subir nueva imagen');
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      // Actualiza el centro con la nueva URL
      const updatedCentro = { ...centro, urlLogo: urlNueva };
      await axios.put(`http://localhost:8080/api/centro-medico/${centro.pkId}`, updatedCentro, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCentro(updatedCentro);
      setLogoSubido(true);
      setMensaje('✅ Logo actualizado correctamente');
    } catch (error) {
      console.error(error);
      setMensaje('❌ No se pudo actualizar el logo');
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta solicitud definitivamente?')) return;

    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.delete(`http://localhost:8080/api/solicitudes-centro-medico/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setSolicitudes(prev => prev.filter(s => s.id !== id));
      setMensaje('✅ Solicitud eliminada');
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al eliminar la solicitud');
    }
  };

  const procesarSolicitud = async (id, rol) => {
    if (!rol) {
      setMensaje('❌ Por favor selecciona un rol para esta solicitud');
      return;
    }

    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/procesar`, 
        { rol },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setSolicitudes(prev => prev.filter(s => s.id !== id));
      setMensaje('✅ Solicitud procesada correctamente');
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al procesar la solicitud');
    }
  };

  // Estilos
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
    },
    tab: (isActive) => ({
      padding: '0.75rem 1.5rem',
      backgroundColor: isActive ? '#4CAF50' : 'white',
      color: isActive ? 'white' : '#333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      backgroundColor: '#f5f5f5',
      borderBottom: '2px solid #ddd',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #ddd',
    },
    form: {
      display: 'grid',
      gap: '1rem',
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    input: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ddd',
    },
    button: (color = '#4CAF50') => ({
      padding: '0.5rem 1rem',
      backgroundColor: color,
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }),
    mensaje: {
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '4px',
      backgroundColor: mensaje.includes('❌') ? '#ffebee' : '#e8f5e9',
      color: mensaje.includes('❌') ? '#c62828' : '#2e7d32',
    },
  };

  if (loading) {
    return <div style={styles.container}>Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {centro?.urlLogo && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img
              src={centro.urlLogo}
              alt="Logo del Centro Médico"
              onClick={() => document.getElementById('input-logo').click()}
              style={{
                maxWidth: '150px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'opacity 0.3s',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
              }}
              title="Haz clic para cambiar el logo"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          id="input-logo"
          style={{ display: 'none' }}
          onChange={handleLogoChange}
        />
        <h1>Panel del Centro Médico</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={styles.button()}
        >
          {showForm ? 'Cancelar' : 'Agregar Médico'}
        </button>
      </div>

      {mensaje && <div style={styles.mensaje}>{mensaje}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>Registrar Nuevo Médico</h2>
          <input
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="tipoDocumento"
            placeholder="Tipo de Documento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="idDocumento"
            placeholder="Número de Documento"
            value={formData.idDocumento}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="profesion"
            placeholder="Profesión"
            value={formData.profesion}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="especialidad"
            placeholder="Especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoCentro}
            style={styles.input}
          />
          {logo && (
            <img
              src={logo}
              alt="Logo del centro"
              style={{ maxWidth: '100px', marginTop: '0.5rem', borderRadius: '8px' }}
            />
          )}
          <input
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
            style={styles.input}
          />
          <select
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Seleccionar género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          <input
            name="tarjetaProfesional"
            placeholder="Tarjeta Profesional"
            value={formData.tarjetaProfesional}
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" style={styles.button()}>
            Registrar Médico
          </button>
        </form>
      )}

      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('medicos')}
          style={styles.tab(activeTab === 'medicos')}
        >
          Médicos
        </button>
        <button 
          onClick={() => setActiveTab('pacientes')}
          style={styles.tab(activeTab === 'pacientes')}
        >
          Pacientes
        </button>
        <button 
          onClick={() => setActiveTab('solicitudes')}
          style={styles.tab(activeTab === 'solicitudes')}
        >
          Solicitudes
        </button>
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
              <tr key={medico.id}>
                <td style={styles.td}>{`${medico.nombre} ${medico.apellido}`}</td>
                <td style={styles.td}>{medico.especialidad}</td>
                <td style={styles.td}>{medico.telefono}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => eliminarMedico(medico.id)}
                    style={styles.button('#f44336')}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : activeTab === 'pacientes' ? (
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
                  {paciente.medicos?.map(m => `${m.nombre} ${m.apellido}`).join(', ') || 'Sin médicos asignados'}
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
              <th style={styles.th}>Correo</th>
              <th style={styles.th}>Teléfono</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td style={styles.td}>{solicitud.nombre}</td>
                <td style={styles.td}>{solicitud.correo}</td>
                <td style={styles.td}>{solicitud.telefono}</td>
                <td style={styles.td}>{solicitud.estado}</td>
                <td style={styles.td}>
                  <select
                    value={rolSeleccionado[solicitud.id] || ''}
                    onChange={(e) => setRolSeleccionado(prev => ({
                      ...prev,
                      [solicitud.id]: e.target.value
                    }))}
                    style={styles.input}
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="MEDICO">Médico</option>
                    <option value="PACIENTE">Paciente</option>
                  </select>
                  <button
                    onClick={() => procesarSolicitud(solicitud.id, rolSeleccionado[solicitud.id])}
                    style={styles.button()}
                  >
                    Procesar
                  </button>
                  <button
                    onClick={() => eliminarSolicitud(solicitud.id)}
                    style={styles.button('#f44336')}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Panel;

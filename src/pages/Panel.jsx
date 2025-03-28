import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Panel = () => {
  // Estados principales
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [activeTab, setActiveTab] = useState('medicos');
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
    urlImagen: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Verificación de autenticación
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        cargarDatos();
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [medicosRes, pacientesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/medicos'),
        axios.get('http://localhost:8080/api/pacientes')
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

  // Crear nuevo médico
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/medicos', formData);
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
        urlImagen: ''
      });
      cargarDatos();
    } catch (error) {
      setMensaje('❌ Error al crear el médico');
    }
  };

  // Eliminar médico
  const eliminarMedico = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este médico?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/medicos/${id}`);
      setMensaje('✅ Médico eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      setMensaje('❌ Error al eliminar el médico');
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
          <input
            name="urlImagen"
            placeholder="URL de la imagen"
            value={formData.urlImagen}
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
                  {paciente.medicos?.map(m => `${m.nombre} ${m.apellido}`).join(', ') || 'Sin médicos asignados'}
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

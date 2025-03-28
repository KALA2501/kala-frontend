import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const AdminPanel = () => {
  // Estados principales
  const [usuarios, setUsuarios] = useState({
    centro_medico: [],
    doctor: [],
    paciente: []
  });
  const [solicitudes, setSolicitudes] = useState([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState({});
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const navigate = useNavigate();

  // Verificación de autenticación
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== 'admin@kala.com') {
        navigate('/login');
      } else {
        setAdminEmail(user.email);
        cargarDatos();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    setLoading(true);
    setMensaje('');
    await Promise.all([
      cargarUsuarios(),
      cargarSolicitudes()
    ]);
    setLoading(false);
  };

  // Cargar usuarios de Firebase
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/usuarios-firebase');
      console.log("🔥 RESPUESTA RAW:", res.data.usuariosPorRol);

      const raw = res.data.usuariosPorRol;
      setUsuarios({
        centro_medico: raw?.['centro_medico'] ?? [],
        doctor: raw?.['doctor'] ?? [],
        paciente: raw?.['paciente'] ?? []
      });
    } catch (error) {
      console.error("❌ ERROR en /usuarios-firebase:", error);

      if (error.response) {
        console.log("📦 Error.response.data:", error.response.data);
        console.log("📦 Status:", error.response.status);
        console.log("📦 Headers:", error.response.headers);
      } else if (error.request) {
        console.log("📡 No hubo respuesta del servidor:", error.request);
      } else {
        console.log("⚠️ Error general:", error.message);
      }

      setMensaje('❌ Error al cargar usuarios');
      setUsuarios({ centro_medico: [], doctor: [], paciente: [] });
    }
  };

  // Cargar solicitudes
  const cargarSolicitudes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/solicitudes-centro-medico');
      setSolicitudes(res.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setMensaje('❌ Error al cargar solicitudes');
      setSolicitudes([]);
    }
  };

  // Manejar cambio de rol
  const handleChangeRol = (id, nuevoRol) => {
    setRolesSeleccionados(prev => ({ ...prev, [id]: nuevoRol }));
  };

  // Procesar solicitud
  const procesarSolicitud = async (id) => {
    const rol = rolesSeleccionados[id];
    if (!rol) {
      setMensaje("⚠️ Selecciona un rol antes de procesar");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/procesar?rol=${rol}`);
      setMensaje('✅ Solicitud procesada exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error al procesar:', error);
      if (error.response?.data?.error === 'EMAIL_EXISTS') {
        setMensaje('⚠️ El correo ya está registrado');
      } else {
        setMensaje('❌ Error al procesar la solicitud');
      }
    }
  };

  // Revertir solicitud
  const revertirSolicitud = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/revertir`);
      setMensaje('🔄 Solicitud revertida');
      await cargarDatos();
    } catch (error) {
      console.error('Error al revertir:', error);
      setMensaje('❌ Error al revertir la solicitud');
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (uid) => {
    if (!window.confirm('¿Confirmas eliminar este usuario?')) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/admin/usuarios-firebase/${uid}`);
      setMensaje('🗑️ Usuario eliminado');
      await cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setMensaje('❌ Error al eliminar el usuario');
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/');
    } catch (error) {
      setMensaje('❌ Error al cerrar sesión');
    }
  };

  // Estilos
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      backgroundColor: 'white',
      padding: '1rem 2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
      fontWeight: 500,
    }),
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      marginTop: '1rem',
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #dee2e6',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
    },
    button: (color = '#4CAF50') => ({
      padding: '0.5rem 1rem',
      backgroundColor: color,
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '0.5rem',
    }),
    mensaje: {
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '4px',
      backgroundColor: mensaje.includes('❌') ? '#ffebee' : '#e8f5e9',
      color: mensaje.includes('❌') ? '#c62828' : '#2e7d32',
    },
    select: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      width: '200px',
    },
  };

  // Agregar justo antes del if(loading)
  console.log("👀 Renderizando usuarios:", usuarios);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>Panel de Administración</h1>
          <p style={{ margin: '0.5rem 0 0 0' }}>👤 {adminEmail}</p>
        </div>
        <button onClick={cerrarSesion} style={styles.button('#333')}>
          Cerrar sesión
        </button>
      </div>

      {mensaje && (
        <div style={styles.mensaje}>{mensaje}</div>
      )}

      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('usuarios')} 
          style={styles.tab(activeTab === 'usuarios')}>
          Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('solicitudes')} 
          style={styles.tab(activeTab === 'solicitudes')}>
          Solicitudes
        </button>
      </div>

      {activeTab === 'usuarios' ? (
        <div style={styles.card}>
          <h2>Usuarios por Rol</h2>
          {Object.entries(usuarios).map(([rol, listaUsuarios]) => (
            <div key={rol} style={{ marginBottom: '2rem' }}>
              <h3 style={{ textTransform: 'capitalize' }}>
                {rol.replace('_', ' ')} ({listaUsuarios.length})
              </h3>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '1rem', 
                borderRadius: '4px',
                marginBottom: '1rem',
                overflow: 'auto'
              }}>
                {JSON.stringify(listaUsuarios, null, 2)}
              </pre>
              {listaUsuarios.length === 0 ? (
                <p>No hay usuarios con este rol.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaUsuarios.map((usuario) => (
                      <tr key={usuario.uid}>
                        <td style={styles.td}>{usuario.email}</td>
                        <td style={styles.td}>
                          {usuario.disabled ? 'Desactivado' : 'Activo'}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => eliminarUsuario(usuario.uid)}
                            style={styles.button('#f44336')}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.card}>
          <h2>Solicitudes de Registro</h2>
          {solicitudes.length === 0 ? (
            <p>No hay solicitudes pendientes.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.nombre}</td>
                    <td style={styles.td}>{s.correo}</td>
                    <td style={styles.td}>{s.telefono}</td>
                    <td style={styles.td}>
                      {s.procesado ? 'Procesado' : 'Pendiente'}
                    </td>
                    <td style={styles.td}>
                      <select
                        value={rolesSeleccionados[s.id] || ''}
                        onChange={(e) => handleChangeRol(s.id, e.target.value)}
                        style={styles.select}
                        disabled={s.procesado}>
                        <option value="">Seleccionar rol</option>
                        <option value="centro_medico">Centro Médico</option>
                        <option value="doctor">Doctor</option>
                        <option value="paciente">Paciente</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      {!s.procesado ? (
                        <button 
                          onClick={() => procesarSolicitud(s.id)}
                          style={styles.button()}>
                          Procesar
                        </button>
                      ) : (
                        <button 
                          onClick={() => revertirSolicitud(s.id)}
                          style={styles.button('#ff9800')}>
                          Revertir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 
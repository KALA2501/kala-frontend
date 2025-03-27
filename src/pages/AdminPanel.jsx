import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const AdminPanel = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuariosFirebase, setUsuariosFirebase] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== 'admin@kala.com') {
        navigate('/admin-login');
      } else {
        setAdminEmail(user.email);
        fetchSolicitudes();
        fetchUsuariosFirebase();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/solicitudes-centro-medico');
      setSolicitudes(res.data);
    } catch (error) {
      setMensaje('❌ Error al cargar solicitudes');
    }
  };

  const fetchUsuariosFirebase = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/usuarios-firebase');
      setUsuariosFirebase(res.data);
    } catch (error) {
      setMensaje('❌ Error al obtener usuarios de Firebase');
    }
  };

  const marcarProcesado = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/procesar`);
      setMensaje('✅ Solicitud marcada como procesada');
      fetchSolicitudes();
    } catch (error) {
      setMensaje('❌ Error al procesar solicitud');
    }
  };

  const revertirProcesado = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/revertir`);
      setMensaje('🔁 Solicitud revertida');
      fetchSolicitudes();
    } catch (error) {
      setMensaje('❌ Error al revertir solicitud');
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm('¿Estás segura de eliminar esta solicitud?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/solicitudes-centro-medico/${id}`);
      setMensaje('🗑️ Solicitud eliminada');
      fetchSolicitudes();
    } catch (error) {
      setMensaje('❌ Error al eliminar la solicitud');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/admin-login');
    } catch (error) {
      setMensaje('❌ Error al cerrar sesión');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Panel de Administración - Solicitudes</h1>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: '#333', color: 'white', padding: '0.5rem 1rem' }}
        >
          Cerrar sesión
        </button>
      </div>
      <p>👤 {adminEmail}</p>

      {mensaje && <p>{mensaje}</p>}

      {solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Procesado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.direccion}</td>
                <td>{s.correo}</td>
                <td>{s.telefono}</td>
                <td>{s.procesado ? 'Sí' : 'No'}</td>
                <td>
                  {!s.procesado ? (
                    <button onClick={() => marcarProcesado(s.id)}>Procesar</button>
                  ) : (
                    <button onClick={() => revertirProcesado(s.id)}>Revertir</button>
                  )}
                  <button
                    onClick={() => eliminarSolicitud(s.id)}
                    style={{ marginLeft: '0.5rem', backgroundColor: '#e74c3c', color: 'white' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '2rem' }}>Usuarios en Firebase</h2>
      {usuariosFirebase.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <ul>
          {usuariosFirebase.map((correo, index) => (
            <li key={index}>{correo}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;

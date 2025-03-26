import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/solicitudes-centro-medico');
      setSolicitudes(res.data);
    } catch (error) {
      setMensaje('❌ Error al cargar solicitudes');
    }
  };

  const marcarProcesado = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/procesar`);
      setMensaje('✅ Solicitud marcada como procesada');
      fetchSolicitudes(); // recargar lista
    } catch (error) {
      setMensaje('❌ Error al procesar solicitud');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Administración - Solicitudes</h1>
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
                  {!s.procesado && (
                    <button onClick={() => marcarProcesado(s.id)}>Procesar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;

import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    correo: '',
    telefono: ''
  });

  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validar = () => {
    let newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'Nombre requerido';
    if (!formData.direccion) newErrors.direccion = 'Dirección requerida';
    if (!formData.correo) {
      newErrors.correo = 'Correo requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }
    if (!formData.telefono) newErrors.telefono = 'Teléfono requerido';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validar();
    if (Object.keys(errores).length > 0) {
      setErrors(errores);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/solicitudes-centros', formData);
      setMensaje('✅ Solicitud enviada correctamente. Revisa tu correo para próximas instrucciones.');
      setFormData({ nombre: '', direccion: '', correo: '', telefono: '' });
      setErrors({});
    } catch (error) {
      if (error.response?.status === 409) {
        setMensaje('⚠️ Ya existe una solicitud o un centro con ese correo o teléfono.');
      } else {
        setMensaje('❌ Error al enviar la solicitud. Intenta nuevamente más tarde.');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido a KALA</h1>
      <p>Plataforma para gestión de actividades cognitivas para adultos mayores.</p>

      <h2>Solicitar registro como Centro Médico</h2>
      {mensaje && <p style={{ color: mensaje.startsWith('✅') ? 'green' : 'red' }}>{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="nombre"
          placeholder="Nombre del centro"
          value={formData.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <div style={{ color: 'red' }}>{errors.nombre}</div>}
        <br />

        <input
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
        />
        {errors.direccion && <div style={{ color: 'red' }}>{errors.direccion}</div>}
        <br />

        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
        />
        {errors.correo && <div style={{ color: 'red' }}>{errors.correo}</div>}
        <br />

        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
        />
        {errors.telefono && <div style={{ color: 'red' }}>{errors.telefono}</div>}
        <br />

        <button type="submit">Enviar solicitud</button>
      </form>
    </div>
  );
};

export default Home;

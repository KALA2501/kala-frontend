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
    if (!formData.correo) newErrors.correo = 'Correo requerido';
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
      // Ajusta esta URL a la de tu backend real
      await axios.post('http://localhost:8080/api/centros-medicos', formData);
      setMensaje('Centro médico registrado correctamente. Revisa tu correo.');
      setFormData({ nombre: '', direccion: '', correo: '', telefono: '' });
      setErrors({});
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMensaje('Ya existe un centro médico con ese correo o teléfono.');
      } else {
        setMensaje('Ocurrió un error al registrar. Intenta más tarde.');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido a KALA</h1>
      <p>Plataforma para gestión de actividades cognitivas para adultos mayores.</p>

      <h2>Solicitar registro como Centro Médico</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="nombre"
          placeholder="Nombre del centro"
          value={formData.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <span style={{ color: 'red' }}>{errors.nombre}</span>}
        <br />

        <input
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
        />
        {errors.direccion && <span style={{ color: 'red' }}>{errors.direccion}</span>}
        <br />

        <input
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
        />
        {errors.correo && <span style={{ color: 'red' }}>{errors.correo}</span>}
        <br />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
        />
        {errors.telefono && <span style={{ color: 'red' }}>{errors.telefono}</span>}
        <br />

        <button type="submit">Enviar solicitud</button>
      </form>
    </div>
  );
};

export default Home;

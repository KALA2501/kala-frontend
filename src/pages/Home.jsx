import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
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
      await axios.post('http://localhost:8080/api/solicitudes-centro-medico', formData);
      setMensaje('✅ Centro médico registrado correctamente. Revisa tu correo.');
      setFormData({ nombre: '', direccion: '', correo: '', telefono: '' });
      setErrors({});
    } catch (error) {
      if (error.response?.status === 409) {
        setMensaje('⚠️ Ya existe una solicitud con ese correo o teléfono.');
      } else {
        setMensaje('❌ Ocurrió un error al registrar. Intenta más tarde.');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Bienvenido a KALA</h1>
        <button 
          onClick={() => navigate('/login')}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Iniciar Sesión
        </button>
      </div>
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

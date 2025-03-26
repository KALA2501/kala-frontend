import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Inicio de sesión exitoso');
      navigate('/panel'); 
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError('Error al enviar el correo de recuperación');
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión - Centro Médico</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Iniciar sesión</button>
      </form>

      <button onClick={() => setShowReset(!showReset)} style={{ marginTop: '10px' }}>
        ¿Olvidaste tu contraseña?
      </button>

      {showReset && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleResetPassword}>Enviar correo de recuperación</button>
          {resetSent && <p style={{ color: 'green' }}>¡Correo enviado! Revisa tu bandeja de entrada.</p>}
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;

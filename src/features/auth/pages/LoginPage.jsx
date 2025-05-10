import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import loginAnimation from '../../../assets/animations/login-animation.json';

import logoKala from '../../../assets/LogoKala.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdTokenResult();
      const rol = token.claims.role || token.claims.rol;

      if (user.email === 'admin@kala.com') navigate('/admin-panel');
      else if (rol?.trim() === 'centro_medico') navigate('/panel');
      else if (rol?.trim() === 'medico') navigate('/medico-panel');
      else if (rol?.trim() === 'paciente') navigate('/paciente-panel');
      else setError('Rol no reconocido. Contacta al administrador.');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch {
      setError('Error al enviar el correo de recuperación');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Animación Lottie */}
      <div className="w-full md:w-1/2 bg-[#F4F0FF] flex items-center justify-center p-8">
        <Lottie animationData={loginAnimation} loop={true} className="w-full max-w-md" />
      </div>

      {/* Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo de KALA */}
          <div className="flex justify-center mb-6">
            <img
              src={logoKala}
              alt="Logo KALA"
              className="h-20 md:h-24 object-contain drop-shadow-md"
            />
          </div>

          <h2 className="text-4xl font-extrabold text-[#30028D] text-center mb-10">Iniciar Sesión</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7358F5]"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7358F5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-3 rounded-lg transition"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowReset(!showReset)}
              className="text-sm text-[#7358F5] hover:text-[#30028D] underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {showReset && (
            <div className="mt-4 text-center">
              <button
                onClick={handleResetPassword}
                className="bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Enviar correo de recuperación
              </button>
              {resetSent && <p className="text-green-600 mt-2">¡Correo enviado! Revisa tu bandeja de entrada.</p>}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-[#7358F5] hover:text-[#30028D] underline"
            >
              Volver al inicio
            </button>
          </div>

          {error && <p className="text-red-600 text-center mt-6">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
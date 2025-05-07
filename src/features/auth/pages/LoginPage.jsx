// features/auth/pages/LoginPage.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';

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

            console.log(token);
            console.log('Rol extraído del token:', rol);

            if (user.email === 'admin@kala.com') {
                navigate('/admin-panel');
            } else if (rol?.trim() === 'centro_medico') {
                navigate('/panel');
            } else if (rol?.trim() === 'medico') {
                navigate('/medico-panel');
            } else if (rol?.trim() === 'paciente') {
                navigate('/paciente-panel');
            } else {
                setError('Rol no reconocido. Contacta al administrador.');
            }
        } catch (err) {
            console.error(err);
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
        <div className="min-h-screen flex items-center justify-center bg-[#F5EE97] px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-3xl font-bold text-center text-[#30028D] mb-8">Iniciar Sesión</h2>

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

                        {/* Botón para mostrar/ocultar */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? (
                                // Icono de OJO ABIERTO
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                // Icono de OJO CERRADO
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.967 9.967 0 012.203-3.592M21 21l-6-6m-4-4l-6-6m2.664 2.664A9.961 9.961 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.978 9.978 0 01-3.157 4.043" />
                                </svg>
                            )}
                        </button>
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-3 rounded-lg transition"
                    >
                        Iniciar sesión
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setShowReset(!showReset)}
                        className="text-[#7358F5] hover:text-[#30028D] text-sm underline"
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
                        {resetSent && (
                            <p className="text-green-600 mt-2">
                                ¡Correo enviado! Revisa tu bandeja de entrada.
                            </p>
                        )}
                    </div>
                )}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#7358F5] hover:text-[#30028D] text-sm underline"
                    >
                        Volver al inicio
                    </button>
                </div>

                {error && (
                    <p className="text-red-600 text-center mt-6">{error}</p>
                )}


                {showReset && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleResetPassword}
                            className="bg-[#7358F5] hover:bg-[#30028D] text-white font-semibold py-2 px-6 rounded-lg transition"
                        >
                            Enviar correo de recuperación
                        </button>
                        {resetSent && (
                            <p className="text-green-600 mt-2">
                                ¡Correo enviado! Revisa tu bandeja de entrada.
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <p className="text-red-600 text-center mt-6">{error}</p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;

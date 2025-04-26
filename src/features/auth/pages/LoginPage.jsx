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
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const token = await user.getIdTokenResult();
            const role = token.claims.role;

            console.log(token);
            console.log('Rol extraído del token:', role);

            if (user.email === 'admin@kala.com') {
                navigate('/admin-panel');
            } else if (role?.trim() === 'centro_medico') {
                navigate('/panel');
            } else if (role?.trim() === 'medico') {
                navigate('/medico-panel');
            } else if (role?.trim() === 'paciente') {
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

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7358F5]"
                    />

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

                {error && (
                    <p className="text-red-600 text-center mt-6">{error}</p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;

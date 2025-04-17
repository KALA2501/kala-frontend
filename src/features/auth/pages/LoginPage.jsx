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
            console.log(token); // Verificar si el token aparece en la consola antes de la redirección

            // ✅ Redirección según rol
            if (user.email === 'admin@kala.com') {
                navigate('/admin-panel');
            } else if (role === 'centro_medico') {
                navigate('/Panel');
            } else if (role === 'medico') {
                navigate('/medico-panel');
            } else if (role === 'paciente') {
                navigate('/PacientePanel');
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
        <div style={{
            maxWidth: '400px',
            margin: '2rem auto',
            padding: '2rem',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: '8px'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Iniciar sesión
                </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                    onClick={() => setShowReset(!showReset)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#4CAF50',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>

            {showReset && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        onClick={handleResetPassword}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Enviar correo de recuperación
                    </button>
                    {resetSent && (
                        <p style={{ color: 'green', marginTop: '0.5rem' }}>
                            ¡Correo enviado! Revisa tu bandeja de entrada.
                        </p>
                    )}
                </div>
            )}

            {error && (
                <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default LoginPage;
